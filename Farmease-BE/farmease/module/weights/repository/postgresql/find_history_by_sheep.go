package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Weight, error) {
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
