// Package postgres provides an Uber Fx module for PostgreSQL connection pooling.
// It uses pgxpool for high-performance, concurrency-safe connection management.
package postgres

import (
	"context"

	"github.com/exaring/otelpgx"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/fx"
)

// Module is the Fx module for PostgreSQL.
// It provides a *pgxpool.Pool to the dependency graph.
var Module = fx.Module("postgres",
	fx.Provide(
		NewPostgres,
	),
)

// Config holds configuration for the PostgreSQL connection.
type Config struct {
	// URL is the connection string (e.g., "postgres://user:pass@host:5432/db").
	// It supports multi-host connection strings for High Availability (failover).
	URL string `config:"postgres_url"`
}

// NewPostgres creates a new PostgreSQL connection pool based on the provided configuration.
// It performs a connectivity check (Ping) during the Fx OnStart hook.
// The pool is automatically closed when the application shuts down.
func NewPostgres(lc fx.Lifecycle, cfg *Config) (*pgxpool.Pool, error) {
	if cfg.URL == "" {
		// Return nil if config is missing (optional module usage)
		return nil, nil
	}

	poolConfig, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, err
	}

	poolConfig.ConnConfig.Tracer = otelpgx.NewTracer()

	conn, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		return nil, err
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			return conn.Ping(ctx)
		},
		OnStop: func(ctx context.Context) error {
			conn.Close()
			return nil
		},
	})

	return conn, nil
}
