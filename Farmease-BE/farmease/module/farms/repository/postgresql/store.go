package postgresql

import (
"context"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
)

func (r *Repository) Store(ctx context.Context, farm *domain.Farm) error {
query := `INSERT INTO farms (id, code, name, location, description, created_at, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`
_, err := r.db.Exec(ctx, query, farm.ID, farm.Code, farm.Name, farm.Location, farm.Description, farm.CreatedAt, farm.CreatedBy)
return err
}
