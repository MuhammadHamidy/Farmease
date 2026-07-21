package postgresql

import (
	"context"
)

// Delete deletes a cage record by its ID.
func (r *Repository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM livestock.cages WHERE id_cage = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
