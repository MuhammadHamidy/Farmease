package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// FindByCode finds a cage record by its unique code.
func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Cage, error) {
	query := `SELECT id_cage, cage_code, capacity, cage_type, farm_id, COALESCE(cage_name, '') as cage_name FROM livestock.cages WHERE cage_code = $1`
	var cage domain.Cage
	err := r.db.QueryRow(ctx, query, code).Scan(&cage.IDCage, &cage.CageCode, &cage.Capacity, &cage.CageType, &cage.FarmID, &cage.CageName)
	if err != nil {
		return nil, err
	}
	return &cage, nil
}
