package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

func (r *Repository) FindAll(ctx context.Context, filter domain.WeightFilter) ([]*domain.Weight, int, error) {
	query := `SELECT id_weight, id_sheep, weighing_date, weight_kg, notes, created_at FROM livestock.weights WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep != "" {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND id_sheep = $%d", len(args))
	}

	query += " ORDER BY weighing_date DESC"

	limit := filter.PerPage
	if limit <= 0 {
		limit = 100
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
	if filter.IDSheep != "" {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return weights, total, err
}
