package postgresql

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/farms/domain"
)

// FindAll queries all recorded farm locations.
func (r *Repository) FindAll(ctx context.Context, param *domain.FarmParam) ([]*domain.Farm, int, error) {
	query := `SELECT id, code, name, location, description, created_at, created_by, updated_at, updated_by FROM farms WHERE deleted_at IS NULL`
	args := []interface{}{}
	index := 1

	if param.Code != "" {
		query += fmt.Sprintf(" AND code ILIKE $%d", index)
		args = append(args, "%"+param.Code+"%")
		index++
	}
	if param.Name != "" {
		query += fmt.Sprintf(" AND name ILIKE $%d", index)
		args = append(args, "%"+param.Name+"%")
		index++
	}

	countQuery := `SELECT COUNT(*) FROM (` + query + `) t`
	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	if param.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", index, index+1)
		args = append(args, param.Limit, param.Offset)
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var farmList []*domain.Farm
	for rows.Next() {
		var farm domain.Farm
		if err := rows.Scan(&farm.ID, &farm.Code, &farm.Name, &farm.Location, &farm.Description, &farm.CreatedAt, &farm.CreatedBy, &farm.UpdatedAt, &farm.UpdatedBy); err != nil {
			return nil, 0, err
		}
		farmList = append(farmList, &farm)
	}
	return farmList, total, nil
}
