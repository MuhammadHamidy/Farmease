package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// Store inserts a new cage record into the database.
func (r *Repository) Store(ctx context.Context, cage *domain.Cage) error {
	query := `
		INSERT INTO livestock.cages (cage_code, capacity, cage_type, farm_id, cage_name)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_cage, created_at, updated_at`
	return r.db.QueryRow(ctx, query, cage.CageCode, cage.Capacity, cage.CageType, cage.FarmID, cage.CageName).Scan(&cage.IDCage, &cage.CreatedAt, &cage.UpdatedAt)
}
