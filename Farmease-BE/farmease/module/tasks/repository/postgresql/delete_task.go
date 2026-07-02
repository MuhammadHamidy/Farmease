package postgresql

import (
	"context"
)

func (r *Repository) DeleteTask(ctx context.Context, id string) error {
	query := `DELETE FROM operations.tasks WHERE id_task = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
