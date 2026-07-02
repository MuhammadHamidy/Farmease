package main

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
)

func main() {
	ctx := context.Background()
	connStr := "postgres://user:pass@localhost:5435/farmease_be?sslmode=disable"
	conn, err := pgx.Connect(ctx, connStr)
	if err != nil {
		fmt.Printf("Gagal menghubungkan ke database: %v\n", err)
		return
	}
	defer conn.Close(ctx)

	rows, err := conn.Query(ctx, `
		SELECT id_pregnancy, id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes
		FROM breeding.pregnancies
	`)
	if err != nil {
		fmt.Printf("Error query: %v\n", err)
		return
	}
	defer rows.Close()

	fmt.Println("=== PREGNANCIES IN DATABASE ===")
	for rows.Next() {
		var idPregnancy, idMating, status, notes string
		var pDate, ebDate interface{}
		err := rows.Scan(&idPregnancy, &idMating, &pDate, &status, &ebDate, &notes)
		if err != nil {
			fmt.Printf("Scan error: %v\n", err)
			return
		}
		fmt.Printf("ID: %s | Mating: %s | Status: %s | Date: %v | HPL: %v | Notes: %s\n",
			idPregnancy, idMating, status, pDate, ebDate, notes)
	}
}
