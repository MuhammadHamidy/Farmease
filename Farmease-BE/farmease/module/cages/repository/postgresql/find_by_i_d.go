package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// FindByID retrieves a single cage detail by its ID, compiling its current occupancy count.
func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Cage, error) {
	query := `
		SELECT id_cage, cage_code, capacity, cage_type,
		       (SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = c.id_cage AND status = 'aktif') as occupancy,
		       created_at, updated_at, farm_id, COALESCE(cage_name, '') as cage_name
		FROM livestock.cages c
		WHERE id_cage = $1`

	var cage domain.Cage
	err := r.db.QueryRow(ctx, query, id).Scan(&cage.IDCage, &cage.CageCode, &cage.Capacity, &cage.CageType, &cage.Occupancy, &cage.CreatedAt, &cage.UpdatedAt, &cage.FarmID, &cage.CageName)
	if err != nil {
		return nil, err
	}
	return &cage, nil
}
