package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Cage, error) {
	query := `SELECT id_cage, cage_code, capacity, cage_type, farm_id, COALESCE(cage_name, '') as cage_name FROM master.cages WHERE cage_code = $1`
	var c domain.Cage
	err := r.db.QueryRow(ctx, query, code).Scan(&c.IDCage, &c.CageCode, &c.Capacity, &c.CageType, &c.FarmID, &c.CageName)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
