package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
)

func main() {
	connStr := "postgres://user:pass@localhost:5435/farmease_peternakan?sslmode=disable"
	conn, err := pgx.Connect(context.Background(), connStr)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(context.Background())

	queries := []string{
		"DROP TABLE IF EXISTS operations.notifications CASCADE;",
		"DROP TABLE IF EXISTS operations.pencatatan_submissions CASCADE;",
		`CREATE TABLE IF NOT EXISTS operations.pencatatan_submissions (
			id_submission UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			submission_code VARCHAR(50) NOT NULL UNIQUE,
			type VARCHAR(50) NOT NULL,
			type_label VARCHAR(100) NOT NULL,
			operator_code VARCHAR(100) NOT NULL,
			operator_name VARCHAR(255) NOT NULL,
			cage_code VARCHAR(50) NOT NULL,
			scope VARCHAR(50) NOT NULL,
			summary TEXT NOT NULL,
			payload JSONB NOT NULL,
			submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			approval_status VARCHAR(20) NOT NULL DEFAULT 'pending',
			reviewed_at TIMESTAMP WITH TIME ZONE NULL,
			reviewed_by VARCHAR(255) NULL,
			review_note TEXT NULL,
			task_id UUID NULL REFERENCES operations.tasks(id_task) ON DELETE SET NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS operations.notifications (
			id_notification UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			title VARCHAR(255),
			message TEXT NOT NULL,
			is_read BOOLEAN DEFAULT FALSE,
			id_account UUID NOT NULL,
			type VARCHAR(50),
			task_id UUID REFERENCES operations.tasks(id_task) ON DELETE SET NULL,
			submission_id UUID REFERENCES operations.pencatatan_submissions(id_submission) ON DELETE SET NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		"CREATE INDEX IF NOT EXISTS idx_pencatatan_submissions_status ON operations.pencatatan_submissions(approval_status);",
		"CREATE INDEX IF NOT EXISTS idx_pencatatan_submissions_operator ON operations.pencatatan_submissions(operator_code);",
		"CREATE INDEX IF NOT EXISTS idx_pencatatan_submissions_code ON operations.pencatatan_submissions(submission_code);",
	}

	for _, q := range queries {
		_, err := conn.Exec(context.Background(), q)
		if err != nil {
			log.Fatalf("Failed to execute: %s, error: %v\n", q, err)
		}
	}
	fmt.Println("Successfully recreated pencatatan_submissions and notifications tables with UUID schema and submission_code!")
}
