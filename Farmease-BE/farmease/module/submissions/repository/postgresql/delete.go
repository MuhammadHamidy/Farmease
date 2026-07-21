package postgresql

import (
	"context"
)

func (r *Repository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM operations.pencatatan_submissions WHERE id_submission = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
