package postgresql

import (
	"context"
)

// UpdateTaskStatus changes status of a task by ID.
func (r *Repository) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE operations.tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_task = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}
