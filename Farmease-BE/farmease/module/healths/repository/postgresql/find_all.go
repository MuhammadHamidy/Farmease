package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

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

	var healths []*domain.Health
	for rows.Next() {
		var k domain.Health
		err := rows.Scan(&k.IDHealth, &k.IDSheep, &k.CheckupDate, &k.Diagnosis, &k.Action, &k.MedicineGiven, &k.InspectorName, &k.Notes, &k.CreatedAt, &k.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		healths = append(healths, &k)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.healths WHERE 1=1"
	if filter.IDSheep != "" {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return healths, total, err
}
