package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
)

func main() {
	connStr := "postgres://user:pass@localhost:5435/farmease_be?sslmode=disable"
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, connStr)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(ctx)

	_, err = conn.Exec(ctx, "ALTER TABLE gardening.jadwal_rutin ADD COLUMN IF NOT EXISTS jam_tenggat VARCHAR(255) DEFAULT '';")
	if err != nil {
		log.Printf("Error adding jam_tenggat to jadwal_rutin: %v\n", err)
	} else {
		fmt.Println("Successfully added jam_tenggat to jadwal_rutin")
	}

	_, err = conn.Exec(ctx, "ALTER TABLE operations.tasks ADD COLUMN IF NOT EXISTS end_time VARCHAR(255) DEFAULT '';")
	if err != nil {
		log.Printf("Error adding end_time to tasks: %v\n", err)
	} else {
		fmt.Println("Successfully added end_time to tasks")
	}

	_, err = conn.Exec(ctx, "ALTER TABLE operations.tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'sedang';")
	if err != nil {
		log.Printf("Error adding priority to tasks: %v\n", err)
	} else {
		fmt.Println("Successfully added priority to tasks")
	}
}
