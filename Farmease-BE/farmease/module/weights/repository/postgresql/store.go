package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

func (r *Repository) Store(ctx context.Context, w *domain.Weight) error {
	query := `INSERT INTO livestock.weights (id_sheep, weighing_date, weight_kg, notes) VALUES ($1, $2, $3, $4) RETURNING id_weight, created_at`
	return r.db.QueryRow(ctx, query, w.IDSheep, w.WeighingDate, w.WeightKg, w.Notes).Scan(&w.IDWeight, &w.CreatedAt)
}
