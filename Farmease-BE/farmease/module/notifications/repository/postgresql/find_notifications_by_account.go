package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
)

func (r *Repository) FindNotificationsByAccount(ctx context.Context, idAccount string) ([]*domain.Notification, error) {
	query := `SELECT id_notification, title, message, is_read, id_account, type, task_id, submission_id, created_at FROM operations.notifications WHERE id_account = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, idAccount)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Notification
	for rows.Next() {
		var n domain.Notification
		err := rows.Scan(&n.IDNotification, &n.Title, &n.Message, &n.IsRead, &n.IDAccount, &n.Type, &n.TaskID, &n.SubmissionID, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &n)
	}
	return list, nil
}
