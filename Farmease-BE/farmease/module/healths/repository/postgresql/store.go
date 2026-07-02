package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

func (r *Repository) Store(ctx context.Context, k *domain.Health) error {
	query := `INSERT INTO livestock.healths (id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_health, created_at, updated_at`
	return r.db.QueryRow(ctx, query, k.IDSheep, k.CheckupDate, k.Diagnosis, k.Action, k.MedicineGiven, k.InspectorName, k.Notes).Scan(&k.IDHealth, &k.CreatedAt, &k.UpdatedAt)
}
