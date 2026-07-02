package postgresql

import (
	"context"
)

func (r *Repository) MarkNotificationRead(ctx context.Context, id string) error {
	query := `UPDATE operations.notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP WHERE id_notification = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
