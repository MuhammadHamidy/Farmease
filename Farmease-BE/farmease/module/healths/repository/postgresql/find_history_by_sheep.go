package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Health, error) {
	query := `SELECT id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes, created_at, updated_at FROM livestock.healths WHERE id_sheep = $1 ORDER BY checkup_date DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Health
	for rows.Next() {
		var k domain.Health
		err := rows.Scan(&k.IDHealth, &k.IDSheep, &k.CheckupDate, &k.Diagnosis, &k.Action, &k.MedicineGiven, &k.InspectorName, &k.Notes, &k.CreatedAt, &k.UpdatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &k)
	}
	return list, nil
}
