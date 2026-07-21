package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/farms/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// FindByID retrieves a single active farm by its UUID.
func (r *Repository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Farm, error) {
	query := `SELECT id, code, name, location, description, created_at, created_by, updated_at, updated_by FROM farms WHERE id = $1 AND deleted_at IS NULL`
	var farm domain.Farm
	err := r.db.QueryRow(ctx, query, id).Scan(&farm.ID, &farm.Code, &farm.Name, &farm.Location, &farm.Description, &farm.CreatedAt, &farm.CreatedBy, &farm.UpdatedAt, &farm.UpdatedBy)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	return &farm, err
}

// FindByCode retrieves a single active farm by its unique code.
func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Farm, error) {
	query := `SELECT id FROM farms WHERE code = $1 AND deleted_at IS NULL`
	var farm domain.Farm
	err := r.db.QueryRow(ctx, query, code).Scan(&farm.ID)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	return &farm, err
}
