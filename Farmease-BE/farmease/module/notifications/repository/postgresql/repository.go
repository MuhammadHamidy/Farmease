package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindNotificationsByAccount(ctx context.Context, idAccount int) ([]*domain.Notification, error) {
	query := `SELECT id_notification, title, message, is_read, id_account, type, created_at FROM operations.notifications WHERE id_account = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, idAccount)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Notification
	for rows.Next() {
		var n domain.Notification
		err := rows.Scan(&n.IDNotification, &n.Title, &n.Message, &n.IsRead, &n.IDAccount, &n.Type, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &n)
	}
	return list, nil
}

func (r *Repository) StoreNotification(ctx context.Context, n *domain.Notification) error {
	query := `INSERT INTO operations.notifications (title, message, is_read, id_account, type) VALUES ($1, $2, $3, $4, $5) RETURNING id_notification`
	return r.db.QueryRow(ctx, query, n.Title, n.Message, n.IsRead, n.IDAccount, n.Type).Scan(&n.IDNotification)
}

func (r *Repository) MarkNotificationRead(ctx context.Context, id int) error {
	query := `UPDATE operations.notifications SET is_read = true WHERE id_notification = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
