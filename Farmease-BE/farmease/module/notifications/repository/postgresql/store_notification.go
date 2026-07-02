package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
)

func (r *Repository) StoreNotification(ctx context.Context, n *domain.Notification) error {
	query := `INSERT INTO operations.notifications (title, message, is_read, id_account, type, task_id, submission_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_notification`
	return r.db.QueryRow(ctx, query, n.Title, n.Message, n.IsRead, n.IDAccount, n.Type, n.TaskID, n.SubmissionID).Scan(&n.IDNotification)
}
