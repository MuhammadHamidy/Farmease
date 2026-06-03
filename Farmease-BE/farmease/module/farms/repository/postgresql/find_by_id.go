package postgresql

import (
"context"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/google/uuid"
"github.com/jackc/pgx/v5"
)

func (r *Repository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Farm, error) {
query := `SELECT id, code, name, location, description, created_at, created_by, updated_at, updated_by FROM farms WHERE id = $1 AND deleted_at IS NULL`
var f domain.Farm
err := r.db.QueryRow(ctx, query, id).Scan(&f.ID, &f.Code, &f.Name, &f.Location, &f.Description, &f.CreatedAt, &f.CreatedBy, &f.UpdatedAt, &f.UpdatedBy)
if err == pgx.ErrNoRows {
return nil, nil
}
return &f, err
}

func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Farm, error) {
query := `SELECT id FROM farms WHERE code = $1 AND deleted_at IS NULL`
var f domain.Farm
err := r.db.QueryRow(ctx, query, code).Scan(&f.ID)
if err == pgx.ErrNoRows {
return nil, nil
}
return &f, err
}
