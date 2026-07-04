package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Cage, error) {
	query := `
		SELECT id_cage, cage_code, capacity, cage_type,
		       (SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = c.id_cage AND status = 'aktif') as occupancy,
		       created_at, updated_at, farm_id, COALESCE(cage_name, '') as cage_name
		FROM livestock.cages c
		WHERE id_cage = $1`

	var c domain.Cage
	err := r.db.QueryRow(ctx, query, id).Scan(&c.IDCage, &c.CageCode, &c.Capacity, &c.CageType, &c.Occupancy, &c.CreatedAt, &c.UpdatedAt, &c.FarmID, &c.CageName)
	if err != nil {
		return nil, err
	}
	return &c, nil
}
