package ratelimit

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
)

// ErrRateLimitExceeded is returned when a rate limit is exceeded.
type ErrRateLimitExceeded struct {
	Window     string
	RetryAfter time.Duration
}

func (e *ErrRateLimitExceeded) Error() string {
	return fmt.Sprintf("rate limit exceeded for %s window, retry after %s", e.Window, e.RetryAfter)
}

// Limiter implements a sliding window rate limiter backed by Redis.
type Limiter struct {
	redis     *redis.Client
	logger    zerolog.Logger
	perMinute int
	perHour   int
}

// NewLimiter creates a new sliding window rate limiter.
func NewLimiter(redisClient *redis.Client, logger zerolog.Logger, perMinute, perHour int) *Limiter {
	return &Limiter{
		redis:     redisClient,
		logger:    logger.With().Str("component", "ratelimiter").Logger(),
		perMinute: perMinute,
		perHour:   perHour,
	}
}

// slidingWindowScript atomically adds the current timestamp, removes expired entries,
// counts remaining entries, and sets the key TTL.
// KEYS[1] = redis key
// ARGV[1] = current timestamp (unix nanoseconds as string)
// ARGV[2] = window start cutoff (unix nanoseconds as string)
// ARGV[3] = window TTL in seconds
// Returns: current count after the operation
var slidingWindowScript = redis.NewScript(`
local key = KEYS[1]
local now = ARGV[1]
local cutoff = ARGV[2]
local ttl = tonumber(ARGV[3])

-- Add current request: score and member are both the nanosecond timestamp
redis.call('ZADD', key, now, now)

-- Remove entries older than the window
redis.call('ZREMRANGEBYSCORE', key, '0', cutoff)

-- Count remaining entries in the window
local count = redis.call('ZCARD', key)

-- Set expiry so keys auto-clean
redis.call('EXPIRE', key, ttl)

return count
`)

// Check validates that the agent hasn't exceeded either the per-minute or per-hour rate limit.
// Returns ErrRateLimitExceeded if a limit is breached.
func (l *Limiter) Check(ctx context.Context, agentID string) error {
	now := time.Now()
	nowNs := now.UnixNano()

	// Check per-minute window
	if err := l.checkWindow(ctx, agentID, "minute", nowNs, time.Minute, l.perMinute); err != nil {
		return err
	}

	// Check per-hour window
	if err := l.checkWindow(ctx, agentID, "hour", nowNs, time.Hour, l.perHour); err != nil {
		return err
	}

	return nil
}

// checkWindow performs the sliding window check for a single window.
func (l *Limiter) checkWindow(ctx context.Context, agentID, windowName string, nowNs int64, window time.Duration, limit int) error {
	key := fmt.Sprintf("ratelimit:%s:%s", agentID, windowName)
	windowNs := window.Nanoseconds()
	cutoffNs := nowNs - windowNs
	ttlSeconds := int(window.Seconds()) + 1 // slight buffer

	result, err := slidingWindowScript.Run(ctx, l.redis, []string{key},
		fmt.Sprintf("%d", nowNs),
		fmt.Sprintf("%d", cutoffNs),
		fmt.Sprintf("%d", ttlSeconds),
	).Int64()

	if err != nil {
		l.logger.Error().Err(err).Str("agent_id", agentID).Str("window", windowName).Msg("rate limit redis error")
		// Fail open on Redis errors to avoid blocking all traffic
		return nil
	}

	if int(result) > limit {
		var retryAfter time.Duration
		switch windowName {
		case "minute":
			retryAfter = time.Minute
		case "hour":
			retryAfter = time.Hour
		default:
			retryAfter = window
		}

		l.logger.Warn().
			Str("agent_id", agentID).
			Str("window", windowName).
			Int64("count", result).
			Int("limit", limit).
			Msg("rate limit exceeded")

		return &ErrRateLimitExceeded{
			Window:     windowName,
			RetryAfter: retryAfter,
		}
	}

	return nil
}
