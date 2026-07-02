package postgresql

import (
	"context"
)

func (r *Repository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM master.cages WHERE id_cage = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
