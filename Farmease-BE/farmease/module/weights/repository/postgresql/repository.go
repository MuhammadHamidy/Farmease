package postgresql

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/weights/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll(ctx context.Context, filter domain.WeightFilter) ([]*domain.Weight, int, error) {
	query := `SELECT id_weight, id_sheep, weighing_date, weight_kg, notes, created_at FROM livestock.weights WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep > 0 {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND id_sheep = $%d", len(args))
	}

	query += " ORDER BY weighing_date DESC"

	limit := filter.PerPage
	if limit <= 0 {
		limit = 20
	}
	offset := (filter.Page - 1) * limit
	if offset < 0 {
		offset = 0
	}
	query += fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var weights []*domain.Weight
	for rows.Next() {
		var w domain.Weight
		err := rows.Scan(&w.IDWeight, &w.IDSheep, &w.WeighingDate, &w.WeightKg, &w.Notes, &w.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		weights = append(weights, &w)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.weights WHERE 1=1"
	if filter.IDSheep > 0 {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return weights, total, err
}

func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep int) ([]*domain.Weight, error) {
	query := `SELECT id_weight, id_sheep, weighing_date, weight_kg, notes, created_at FROM livestock.weights WHERE id_sheep = $1 ORDER BY weighing_date DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Weight
	for rows.Next() {
		var w domain.Weight
		err := rows.Scan(&w.IDWeight, &w.IDSheep, &w.WeighingDate, &w.WeightKg, &w.Notes, &w.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &w)
	}
	return list, nil
}

func (r *Repository) Store(ctx context.Context, w *domain.Weight) error {
	query := `INSERT INTO livestock.weights (id_sheep, weighing_date, weight_kg, notes) VALUES ($1, $2, $3, $4) RETURNING id_weight, created_at`
	return r.db.QueryRow(ctx, query, w.IDSheep, w.WeighingDate, w.WeightKg, w.Notes).Scan(&w.IDWeight, &w.CreatedAt)
}
