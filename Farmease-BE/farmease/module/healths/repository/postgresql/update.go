package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

// Update updates fields of an existing health log.
func (r *Repository) Update(ctx context.Context, health *domain.Health) error {
	query := `UPDATE livestock.healths SET diagnosis = $1, action = $2, medicine_given = $3, inspector_name = $4, notes = $5, updated_at = CURRENT_TIMESTAMP WHERE id_health = $6`
	_, err := r.db.Exec(ctx, query, health.Diagnosis, health.Action, health.MedicineGiven, health.InspectorName, health.Notes, health.IDHealth)
	return err
}
