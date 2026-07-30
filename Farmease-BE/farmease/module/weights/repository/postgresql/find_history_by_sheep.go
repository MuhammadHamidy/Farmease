package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

// FindHistoryBySheep lists all historical weight check entries for a specific sheep ID.
func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Weight, error) {
	query := `SELECT id_weight, id_sheep, weighing_date, weight_kg, notes, created_at FROM livestock.weights WHERE id_sheep = $1 ORDER BY weighing_date DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var weightList []*domain.Weight
	for rows.Next() {
		var weight domain.Weight
		err := rows.Scan(&weight.IDWeight, &weight.IDSheep, &weight.WeighingDate, &weight.WeightKg, &weight.Notes, &weight.CreatedAt)
		if err != nil {
			return nil, err
		}
		weightList = append(weightList, &weight)
	}
	return weightList, nil
}
