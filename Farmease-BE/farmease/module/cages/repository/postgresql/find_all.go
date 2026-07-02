package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (r *Repository) FindAll(ctx context.Context, filter domain.CageFilter) ([]*domain.Cage, int, error) {
	query := `
		SELECT id_cage, cage_code, capacity, cage_type,
		       (SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = c.id_cage AND status = 'aktif') as occupancy,
		       created_at, updated_at, farm_id, COALESCE(cage_name, '') as cage_name
		FROM master.cages c
		WHERE 1=1`

	args := []interface{}{}
	if filter.CageType != "" {
		args = append(args, filter.CageType)
		query += fmt.Sprintf(" AND cage_type = $%d", len(args))
	}

	// Pagination
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

	var cages []*domain.Cage
	for rows.Next() {
		var c domain.Cage
		err := rows.Scan(&c.IDCage, &c.CageCode, &c.Capacity, &c.CageType, &c.Occupancy, &c.CreatedAt, &c.UpdatedAt, &c.FarmID, &c.CageName)
		if err != nil {
			return nil, 0, err
		}
		cages = append(cages, &c)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM master.cages WHERE 1=1"
	if filter.CageType != "" {
		countQuery += " AND cage_type = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.CageType).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return cages, total, err
}
