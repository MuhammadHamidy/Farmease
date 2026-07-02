package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (r *Repository) FindAll(ctx context.Context, filter domain.ManureFilter) ([]*domain.Manure, int, error) {
	query := `SELECT id_manure, id_sheep, activity_type, amount, unit, external_destination_id, destination_type, notes, created_at FROM logistics.manures WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep != "" {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND id_sheep = $%d", len(args))
	}

	query += " ORDER BY created_at DESC"

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

	var list []*domain.Manure
	for rows.Next() {
		var m domain.Manure
		err := rows.Scan(&m.IDManure, &m.IDSheep, &m.ActivityType, &m.Amount, &m.Unit, &m.ExternalDestinationID, &m.DestinationType, &m.Notes, &m.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		list = append(list, &m)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM logistics.manures WHERE 1=1"
	if filter.IDSheep != "" {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return list, total, err
}
