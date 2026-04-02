package db

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPool creates a new pgx connection pool with reasonable settings.
func NewPool(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	cfg.MaxConns = 25
	cfg.MinConns = 5

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return pool, nil
}

// RunMigrations reads and executes all SQL files from internal/db/migrations/ in lexicographic order.
func RunMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	// Resolve migrations directory relative to this file's location
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		return fmt.Errorf("could not determine caller file path")
	}

	migrationsDir := filepath.Join(filepath.Dir(filename), "migrations")

	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory %s: %w", migrationsDir, err)
	}

	// Collect and sort SQL files
	var sqlFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".sql") {
			sqlFiles = append(sqlFiles, filepath.Join(migrationsDir, entry.Name()))
		}
	}
	sort.Strings(sqlFiles)

	if len(sqlFiles) == 0 {
		return nil
	}

	// Execute each migration in a transaction
	for _, sqlFile := range sqlFiles {
		if err := runMigrationFile(ctx, pool, sqlFile); err != nil {
			return fmt.Errorf("migration %s failed: %w", filepath.Base(sqlFile), err)
		}
	}

	return nil
}

// runMigrationFile executes a single SQL migration file within a transaction.
func runMigrationFile(ctx context.Context, pool *pgxpool.Pool, filePath string) error {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	if _, err := tx.Exec(ctx, string(content)); err != nil {
		return fmt.Errorf("failed to execute migration: %w", err)
	}

	return tx.Commit(ctx)
}

// Close closes the connection pool gracefully.
func Close(pool *pgxpool.Pool) {
	if pool != nil {
		pool.Close()
	}
}
