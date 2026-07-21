package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

// Store creates a new health checkup database log.
func (r *Repository) Store(ctx context.Context, health *domain.Health) error {
	query := `INSERT INTO livestock.healths (id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_health, created_at, updated_at`
	return r.db.QueryRow(ctx, query, health.IDSheep, health.CheckupDate, health.Diagnosis, health.Action, health.MedicineGiven, health.InspectorName, health.Notes).Scan(&health.IDHealth, &health.CreatedAt, &health.UpdatedAt)
}
