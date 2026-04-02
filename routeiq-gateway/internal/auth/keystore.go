package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"golang.org/x/crypto/bcrypt"
)

const (
	redisKeyPrefix = "apikey:"
	redisTTL       = 5 * time.Minute
	keyPrefix      = "routeiq-"
)

// cachedIdentity is the structure stored in Redis cache.
type cachedIdentity struct {
	AgentID        string    `json:"agent_id"`
	OrgID          string    `json:"org_id"`
	TeamID         string    `json:"team_id"`
	Name           string    `json:"name"`
	DailyBudgetUSD float64   `json:"daily_budget_usd"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
}

// KeyStore validates API keys against Redis cache and PostgreSQL.
type KeyStore struct {
	redis  *redis.Client
	pg     *pgxpool.Pool
	logger zerolog.Logger
}

// NewKeyStore creates a new KeyStore.
func NewKeyStore(redisClient *redis.Client, pgPool *pgxpool.Pool, logger zerolog.Logger) *KeyStore {
	return &KeyStore{
		redis:  redisClient,
		pg:     pgPool,
		logger: logger.With().Str("component", "keystore").Logger(),
	}
}

// ValidateKey validates the raw API key and returns the AgentIdentity on success.
// Key format: "routeiq-" followed by base62-encoded secret.
func (k *KeyStore) ValidateKey(ctx context.Context, rawKey string) (*AgentIdentity, error) {
	if !strings.HasPrefix(rawKey, keyPrefix) {
		k.logger.Debug().Msg("key missing required prefix")
		return nil, &AuthError{Code: ErrCodeInvalidAPIKey, Message: "invalid API key format"}
	}

	keyHash := k.generateKeyHash(rawKey)
	redisKey := redisKeyPrefix + keyHash

	// Attempt Redis cache lookup
	identity, err := k.lookupRedis(ctx, redisKey)
	if err == nil {
		k.logger.Debug().Str("agent_id", identity.AgentID).Msg("key validated from cache")
		if !identity.IsActive {
			return nil, &AuthError{Code: ErrCodeAgentSuspended, Message: "agent is suspended"}
		}
		return identity, nil
	}

	if err != redis.Nil {
		// Log Redis error but continue to PG fallback
		k.logger.Warn().Err(err).Msg("redis lookup failed, falling back to postgres")
	}

	// Cache miss: query PostgreSQL
	identity, err = k.lookupPostgres(ctx, rawKey, keyHash)
	if err != nil {
		return nil, err
	}

	// Backfill Redis cache (non-blocking on error)
	if cacheErr := k.cacheIdentity(ctx, redisKey, identity); cacheErr != nil {
		k.logger.Warn().Err(cacheErr).Str("agent_id", identity.AgentID).Msg("failed to backfill redis cache")
	}

	if !identity.IsActive {
		return nil, &AuthError{Code: ErrCodeAgentSuspended, Message: "agent is suspended"}
	}

	return identity, nil
}

// lookupRedis retrieves a cached AgentIdentity from Redis.
func (k *KeyStore) lookupRedis(ctx context.Context, redisKey string) (*AgentIdentity, error) {
	data, err := k.redis.Get(ctx, redisKey).Bytes()
	if err != nil {
		return nil, err
	}

	var cached cachedIdentity
	if err := json.Unmarshal(data, &cached); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cached identity: %w", err)
	}

	return &AgentIdentity{
		AgentID:        cached.AgentID,
		OrgID:          cached.OrgID,
		TeamID:         cached.TeamID,
		Name:           cached.Name,
		DailyBudgetUSD: cached.DailyBudgetUSD,
		IsActive:       cached.IsActive,
		CreatedAt:      cached.CreatedAt,
	}, nil
}

// lookupPostgres queries PostgreSQL to find and validate the API key using bcrypt.
func (k *KeyStore) lookupPostgres(ctx context.Context, rawKey, keyHash string) (*AgentIdentity, error) {
	// Query all potential matching agents by the key prefix (first 8 chars after "routeiq-")
	// We use bcrypt compare to find the matching key
	query := `
		SELECT
			a.id,
			a.team_id,
			t.org_id,
			a.name,
			COALESCE(a.daily_budget_usd, 0) AS daily_budget_usd,
			a.is_active,
			a.created_at,
			a.api_key_hash
		FROM agents a
		JOIN teams t ON t.id = a.team_id
		WHERE a.api_key_hash = $1
	`

	// For bcrypt, we store the bcrypt hash. However, we also support SHA-256 direct comparison
	// for performance. Try direct SHA-256 first (stored as sha256hex), then try bcrypt.
	var (
		agentID        string
		teamID         string
		orgID          string
		name           string
		dailyBudgetUSD float64
		isActive       bool
		createdAt      time.Time
		storedHash     string
	)

	// First try: direct SHA-256 hash match (fast path)
	err := k.pg.QueryRow(ctx, query, keyHash).Scan(
		&agentID, &teamID, &orgID, &name, &dailyBudgetUSD, &isActive, &createdAt, &storedHash,
	)

	if err != nil {
		// Try bcrypt path: fetch candidates by prefix and compare
		bcryptQuery := `
			SELECT
				a.id,
				a.team_id,
				t.org_id,
				a.name,
				COALESCE(a.daily_budget_usd, 0) AS daily_budget_usd,
				a.is_active,
				a.created_at,
				a.api_key_hash
			FROM agents a
			JOIN teams t ON t.id = a.team_id
			WHERE a.api_key_prefix = $1
		`
		prefix := extractPrefix(rawKey)
		rows, qErr := k.pg.Query(ctx, bcryptQuery, prefix)
		if qErr != nil {
			k.logger.Error().Err(qErr).Msg("postgres query failed")
			return nil, &AuthError{Code: ErrCodeInvalidAPIKey, Message: "invalid API key"}
		}
		defer rows.Close()

		found := false
		for rows.Next() {
			if scanErr := rows.Scan(&agentID, &teamID, &orgID, &name, &dailyBudgetUSD, &isActive, &createdAt, &storedHash); scanErr != nil {
				continue
			}
			// Compare raw key against bcrypt hash
			if bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(rawKey)) == nil {
				found = true
				break
			}
		}

		if !found {
			k.logger.Debug().Msg("no matching agent found in postgres")
			return nil, &AuthError{Code: ErrCodeInvalidAPIKey, Message: "invalid API key"}
		}
	}

	return &AgentIdentity{
		AgentID:        agentID,
		TeamID:         teamID,
		OrgID:          orgID,
		Name:           name,
		DailyBudgetUSD: dailyBudgetUSD,
		IsActive:       isActive,
		CreatedAt:      createdAt,
	}, nil
}

// cacheIdentity stores the AgentIdentity in Redis with a TTL.
func (k *KeyStore) cacheIdentity(ctx context.Context, redisKey string, identity *AgentIdentity) error {
	cached := cachedIdentity{
		AgentID:        identity.AgentID,
		OrgID:          identity.OrgID,
		TeamID:         identity.TeamID,
		Name:           identity.Name,
		DailyBudgetUSD: identity.DailyBudgetUSD,
		IsActive:       identity.IsActive,
		CreatedAt:      identity.CreatedAt,
	}

	data, err := json.Marshal(cached)
	if err != nil {
		return fmt.Errorf("failed to marshal identity for cache: %w", err)
	}

	return k.redis.Set(ctx, redisKey, data, redisTTL).Err()
}

// generateKeyHash creates a SHA-256 hex hash of the raw API key.
func (k *KeyStore) generateKeyHash(rawKey string) string {
	h := sha256.Sum256([]byte(rawKey))
	return hex.EncodeToString(h[:])
}

// extractPrefix extracts the key prefix (first 8 chars of the part after "routeiq-").
func extractPrefix(rawKey string) string {
	trimmed := strings.TrimPrefix(rawKey, keyPrefix)
	if len(trimmed) > 8 {
		return trimmed[:8]
	}
	return trimmed
}
