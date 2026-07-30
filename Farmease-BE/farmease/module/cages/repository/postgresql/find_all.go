package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// FindAll queries all registered cages with optional type filter and pagination.
func (r *Repository) FindAll(ctx context.Context, filter domain.CageFilter) ([]*domain.Cage, int, error) {
	query := `
		SELECT id_cage, cage_code, capacity, cage_type,
		       (SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = c.id_cage AND status = 'aktif') as occupancy,
		       created_at, updated_at, farm_id, COALESCE(cage_name, '') as cage_name
		FROM livestock.cages c
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

	var cageList []*domain.Cage
	for rows.Next() {
		var cage domain.Cage
		err := rows.Scan(&cage.IDCage, &cage.CageCode, &cage.Capacity, &cage.CageType, &cage.Occupancy, &cage.CreatedAt, &cage.UpdatedAt, &cage.FarmID, &cage.CageName)
		if err != nil {
			return nil, 0, err
		}
		cageList = append(cageList, &cage)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.cages WHERE 1=1"
	if filter.CageType != "" {
		countQuery += " AND cage_type = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.CageType).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return cageList, total, err
}
