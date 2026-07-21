package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (r *Repository) Update(ctx context.Context, c *domain.Cage) error {
	query := `
		UPDATE livestock.cages
		SET cage_code = $1, capacity = $2, cage_type = $3, farm_id = $4, cage_name = $5, updated_at = CURRENT_TIMESTAMP
		WHERE id_cage = $6`
	_, err := r.db.Exec(ctx, query, c.CageCode, c.Capacity, c.CageType, c.FarmID, c.CageName, c.IDCage)
	return err
}
