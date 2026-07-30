package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// Update updates fields of a cage record by its ID.
func (r *Repository) Update(ctx context.Context, cage *domain.Cage) error {
	query := `
		UPDATE livestock.cages
		SET cage_code = $1, capacity = $2, cage_type = $3, farm_id = $4, cage_name = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id_cage = $6`
	_, err := r.db.Exec(ctx, query, cage.CageCode, cage.Capacity, cage.CageType, cage.FarmID, cage.CageName, cage.IDCage)
	return err
}
