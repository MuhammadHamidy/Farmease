package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (r *Repository) Store(ctx context.Context, c *domain.Cage) error {
	query := `
		INSERT INTO master.cages (cage_code, capacity, cage_type, farm_id, cage_name)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_cage, created_at, updated_at`
	return r.db.QueryRow(ctx, query, c.CageCode, c.Capacity, c.CageType, c.FarmID, c.CageName).Scan(&c.IDCage, &c.CreatedAt, &c.UpdatedAt)
}
