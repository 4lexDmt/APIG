package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all configuration loaded from environment variables.
// Fails fast on missing required variables.
type Config struct {
	Port             string
	Env              string
	LogLevel         string
	DatabaseURL      string
	RedisURL         string
	RedisPoolSize    int
	OpenAIAPIKey     string
	OpenAIBaseURL    string
	JWTSecret        string
	APIKeySalt       string
	RateLimitPerMin  int
	RateLimitPerHour int
	OTELEndpoint     string
	OTELServiceName  string
}

// Load reads configuration from environment variables, failing fast on missing required values.
func Load() (*Config, error) {
	cfg := &Config{}
	var missing []string

	cfg.Port = getEnvDefault("PORT", "8080")
	cfg.Env = getEnvDefault("ENV", "development")
	cfg.LogLevel = getEnvDefault("LOG_LEVEL", "info")

	cfg.DatabaseURL = requireEnv("DATABASE_URL", &missing)
	cfg.RedisURL = requireEnv("REDIS_URL", &missing)
	cfg.OpenAIAPIKey = requireEnv("OPENAI_API_KEY", &missing)
	cfg.JWTSecret = requireEnv("JWT_SECRET", &missing)
	cfg.APIKeySalt = requireEnv("API_KEY_SALT", &missing)

	cfg.OpenAIBaseURL = getEnvDefault("OPENAI_BASE_URL", "https://api.openai.com/v1")
	cfg.OTELEndpoint = getEnvDefault("OTEL_EXPORTER_OTLP_ENDPOINT", "")
	cfg.OTELServiceName = getEnvDefault("OTEL_SERVICE_NAME", "routeiq-gateway")

	var err error
	cfg.RedisPoolSize, err = strconv.Atoi(getEnvDefault("REDIS_POOL_SIZE", "20"))
	if err != nil {
		return nil, fmt.Errorf("invalid REDIS_POOL_SIZE: %w", err)
	}
	cfg.RateLimitPerMin, err = strconv.Atoi(getEnvDefault("RATE_LIMIT_PER_MINUTE", "60"))
	if err != nil {
		return nil, fmt.Errorf("invalid RATE_LIMIT_PER_MINUTE: %w", err)
	}
	cfg.RateLimitPerHour, err = strconv.Atoi(getEnvDefault("RATE_LIMIT_PER_HOUR", "1000"))
	if err != nil {
		return nil, fmt.Errorf("invalid RATE_LIMIT_PER_HOUR: %w", err)
	}

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required environment variables: %v", missing)
	}
	return cfg, nil
}

func requireEnv(key string, missing *[]string) string {
	v := os.Getenv(key)
	if v == "" {
		*missing = append(*missing, key)
	}
	return v
}

func getEnvDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
