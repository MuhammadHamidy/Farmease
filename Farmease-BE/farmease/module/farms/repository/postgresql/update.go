package postgresql

import (
"context"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
)

func (r *Repository) Update(ctx context.Context, farm *domain.Farm) error {
query := `UPDATE farms SET code = $1, name = $2, location = $3, description = $4, updated_at = $5, updated_by = $6 WHERE id = $7`
_, err := r.db.Exec(ctx, query, farm.Code, farm.Name, farm.Location, farm.Description, farm.UpdatedAt, farm.UpdatedBy, farm.ID)
return err
}
