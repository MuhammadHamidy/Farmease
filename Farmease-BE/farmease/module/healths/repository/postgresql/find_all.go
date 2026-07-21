package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

// FindAll queries all registered sheep health/checkup records with optional filters.
func (r *Repository) FindAll(ctx context.Context, filter domain.HealthFilter) ([]*domain.Health, int, error) {
	query := `SELECT id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes, created_at, updated_at FROM livestock.healths WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep != "" {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND id_sheep = $%d", len(args))
	}

	query += " ORDER BY checkup_date DESC"

	limit := filter.PerPage
	if limit <= 0 {
		limit = 100
	}
	offset := (filter.Page - 1) * limit
	if offset < 0 {
		offset = 0
	}
	query += fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var healthList []*domain.Health
	for rows.Next() {
		var health domain.Health
		err := rows.Scan(&health.IDHealth, &health.IDSheep, &health.CheckupDate, &health.Diagnosis, &health.Action, &health.MedicineGiven, &health.InspectorName, &health.Notes, &health.CreatedAt, &health.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		healthList = append(healthList, &health)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.healths WHERE 1=1"
	if filter.IDSheep != "" {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return healthList, total, err
}
