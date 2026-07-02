package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

func (r *Repository) Update(ctx context.Context, k *domain.Health) error {
	query := `UPDATE livestock.healths SET diagnosis = $1, action = $2, medicine_given = $3, inspector_name = $4, notes = $5, updated_at = CURRENT_TIMESTAMP WHERE id_health = $6`
	_, err := r.db.Exec(ctx, query, k.Diagnosis, k.Action, k.MedicineGiven, k.InspectorName, k.Notes, k.IDHealth)
	return err
}
