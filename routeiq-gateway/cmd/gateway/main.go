package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	internalapi "github.com/routeiq/gateway/internal/api"
	"github.com/routeiq/gateway/internal/api/handler"
	"github.com/routeiq/gateway/internal/auth"
	"github.com/routeiq/gateway/internal/config"
	"github.com/routeiq/gateway/internal/db"
	"github.com/routeiq/gateway/internal/proxy"
	"github.com/routeiq/gateway/internal/ratelimit"
	"github.com/routeiq/gateway/internal/telemetry"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "fatal: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	// Step 1: Load configuration (fail fast on missing required vars)
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("config: %w", err)
	}

	// Step 2: Setup structured zerolog logger
	logger := setupLogger(cfg)
	logger.Info().
		Str("env", cfg.Env).
		Str("port", cfg.Port).
		Msg("starting routeiq-gateway")

	// Step 3: Setup OpenTelemetry (with shutdown deferred)
	ctx := context.Background()
	otelShutdown, err := telemetry.Setup(ctx, cfg)
	if err != nil {
		return fmt.Errorf("telemetry setup: %w", err)
	}
	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := otelShutdown(shutdownCtx); err != nil {
			logger.Warn().Err(err).Msg("otel shutdown error")
		}
	}()

	// Step 4: Connect to PostgreSQL
	pgPool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("postgres: %w", err)
	}
	defer db.Close(pgPool)
	logger.Info().Msg("postgres connection pool established")

	// Step 5: Run database migrations
	if err := db.RunMigrations(ctx, pgPool); err != nil {
		return fmt.Errorf("migrations: %w", err)
	}
	logger.Info().Msg("database migrations completed")

	// Step 6: Connect to Redis
	redisClient, err := setupRedis(cfg)
	if err != nil {
		return fmt.Errorf("redis: %w", err)
	}
	defer func() {
		if err := redisClient.Close(); err != nil {
			logger.Warn().Err(err).Msg("redis close error")
		}
	}()
	logger.Info().Msg("redis connection established")

	// Step 7: Create KeyStore, Limiter, and OpenAI Provider
	keystore := auth.NewKeyStore(redisClient, pgPool, logger)
	limiter := ratelimit.NewLimiter(redisClient, logger, cfg.RateLimitPerMin, cfg.RateLimitPerHour)
	openaiProvider := proxy.NewProvider(cfg.OpenAIAPIKey, cfg.OpenAIBaseURL, logger)

	// Step 8: Create handlers and router
	chatHandler := handler.NewChatHandler(openaiProvider, limiter, pgPool, logger)
	healthHandler := handler.NewHealthHandler(pgPool, redisClient)
	router := internalapi.NewRouter(chatHandler, healthHandler, keystore, logger)

	// Step 9: Start HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Channel to receive server errors
	serverErr := make(chan error, 1)
	go func() {
		logger.Info().Str("addr", srv.Addr).Msg("HTTP server listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			serverErr <- err
		}
	}()

	// Step 10: Trap SIGTERM/SIGINT for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	select {
	case sig := <-quit:
		logger.Info().Str("signal", sig.String()).Msg("shutdown signal received")
	case err := <-serverErr:
		return fmt.Errorf("server error: %w", err)
	}

	// Graceful shutdown with 30-second timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	logger.Info().Msg("shutting down HTTP server...")
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error().Err(err).Msg("HTTP server shutdown error")
	}

	logger.Info().Msg("shutdown complete")
	return nil
}

// setupLogger configures zerolog based on the config.
func setupLogger(cfg *config.Config) zerolog.Logger {
	// Parse log level
	level, err := zerolog.ParseLevel(cfg.LogLevel)
	if err != nil {
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	// JSON output for production, pretty for development
	var logger zerolog.Logger
	if cfg.Env == "development" {
		logger = zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339}).
			With().
			Timestamp().
			Str("service", "routeiq-gateway").
			Logger()
	} else {
		logger = zerolog.New(os.Stdout).
			With().
			Timestamp().
			Str("service", "routeiq-gateway").
			Logger()
	}

	// Set global logger
	log.Logger = logger
	return logger
}

// setupRedis creates and verifies a Redis client connection.
func setupRedis(cfg *config.Config) (*redis.Client, error) {
	opt, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	opt.PoolSize = cfg.RedisPoolSize
	opt.MinIdleConns = 5
	opt.ConnMaxIdleTime = 30 * time.Minute

	client := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		client.Close()
		return nil, fmt.Errorf("failed to ping Redis: %w", err)
	}

	return client, nil
}
