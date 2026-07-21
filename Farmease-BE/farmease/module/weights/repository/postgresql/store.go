package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

// Store creates a new weight record entry.
func (r *Repository) Store(ctx context.Context, weight *domain.Weight) error {
	query := `INSERT INTO livestock.weights (id_sheep, weighing_date, weight_kg, notes) VALUES ($1, $2, $3, $4) RETURNING id_weight, created_at`
	return r.db.QueryRow(ctx, query, weight.IDSheep, weight.WeighingDate, weight.WeightKg, weight.Notes).Scan(&weight.IDWeight, &weight.CreatedAt)
}
