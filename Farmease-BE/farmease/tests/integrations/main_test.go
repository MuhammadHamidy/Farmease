package integrations

import (
"context"
"fmt"
"os"
"path/filepath"
"sort"
"testing"
"time"

"github.com/jackc/pgx/v5/pgxpool"
"github.com/testcontainers/testcontainers-go"
"github.com/testcontainers/testcontainers-go/modules/postgres"
"github.com/testcontainers/testcontainers-go/wait"
)

var (
testPool *pgxpool.Pool
)

func TestMain(m *testing.M) {
ctx := context.Background()

// 1. Start Postgres Container
pgContainer, err := postgres.Run(ctx,
"postgres:16-alpine",
postgres.WithDatabase("farmease_test"),
postgres.WithUsername("testuser"),
postgres.WithPassword("testpass"),
testcontainers.WithWaitStrategy(
wait.ForLog("database system is ready to accept connections").
WithOccurrence(2).
WithStartupTimeout(30*time.Second),
),
)
if err != nil {
fmt.Fprintf(os.Stderr, "failed to start postgres container: %v\n", err)
os.Exit(1)
}

connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
if err != nil {
fmt.Fprintf(os.Stderr, "failed to get connection string: %v\n", err)
pgContainer.Terminate(ctx)
os.Exit(1)
}

// 2. Connect to DB
testPool, err = pgxpool.New(ctx, connStr)
if err != nil {
fmt.Fprintf(os.Stderr, "failed to connect to db: %v\n", err)
pgContainer.Terminate(ctx)
os.Exit(1)
}

// 3. Apply test migrations
if err := applyMigrations(ctx, testPool, "../migrations"); err != nil {
fmt.Fprintf(os.Stderr, "failed to apply migrations: %v\n", err)
testPool.Close()
pgContainer.Terminate(ctx)
os.Exit(1)
}

// 4. Seed Data
if err := seedData(ctx, testPool, "../fixtures/seeder.sql"); err != nil {
fmt.Fprintf(os.Stderr, "failed to seed data: %v\n", err)
testPool.Close()
pgContainer.Terminate(ctx)
os.Exit(1)
}

// 5. Run Tests
code := m.Run()

// 6. Cleanup
testPool.Close()
pgContainer.Terminate(ctx)

os.Exit(code)
}

func applyMigrations(ctx context.Context, db *pgxpool.Pool, dir string) error {
entries, err := os.ReadDir(dir)
if err != nil {
return err
}

var migrationFiles []string
for _, entry := range entries {
if !entry.IsDir() && filepath.Ext(entry.Name()) == ".sql" {
migrationFiles = append(migrationFiles, entry.Name())
}
}
sort.Strings(migrationFiles)

for _, file := range migrationFiles {
content, err := os.ReadFile(filepath.Join(dir, file))
if err != nil {
return fmt.Errorf("failed to read migration %s: %w", file, err)
}
if _, err := db.Exec(ctx, string(content)); err != nil {
return fmt.Errorf("failed to exec migration %s: %w", file, err)
}
}
return nil
}

func seedData(ctx context.Context, db *pgxpool.Pool, file string) error {
content, err := os.ReadFile(file)
if err != nil {
return err
}
if _, err := db.Exec(ctx, string(content)); err != nil {
return err
}
return nil
}
