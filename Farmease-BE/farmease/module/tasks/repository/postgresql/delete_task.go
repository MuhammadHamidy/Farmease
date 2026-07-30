package postgresql

import (
	"context"
)

// DeleteTask removes an existing task record.
func (r *Repository) DeleteTask(ctx context.Context, id string) error {
	query := `DELETE FROM operations.tasks WHERE id_task = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
