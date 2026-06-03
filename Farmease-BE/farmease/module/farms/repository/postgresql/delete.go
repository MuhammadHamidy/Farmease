package postgresql

import (
"context"

"github.com/google/uuid"
)

func (r *Repository) Delete(ctx context.Context, id uuid.UUID, deletedBy string) error {
query := `UPDATE farms SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`
_, err := r.db.Exec(ctx, query, deletedBy, id)
return err
}
