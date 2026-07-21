package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

// FindHistoryBySheep lists all medical logs registered for a specific sheep tag ID.
func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Health, error) {
	query := `SELECT id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes, created_at, updated_at FROM livestock.healths WHERE id_sheep = $1 ORDER BY checkup_date DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var healthList []*domain.Health
	for rows.Next() {
		var health domain.Health
		err := rows.Scan(&health.IDHealth, &health.IDSheep, &health.CheckupDate, &health.Diagnosis, &health.Action, &health.MedicineGiven, &health.InspectorName, &health.Notes, &health.CreatedAt, &health.UpdatedAt)
		if err != nil {
			return nil, err
		}
		healthList = append(healthList, &health)
	}
	return healthList, nil
}
