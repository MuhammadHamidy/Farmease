package domain

import (
	"context"
	"time"
)

type Notification struct {
	IDNotification int       `json:"id_notification" db:"id_notification"`
	Title          string    `json:"title" db:"title"`
	Message        string    `json:"message" db:"message"`
	IsRead         bool      `json:"is_read" db:"is_read"`
	IDAccount      int       `json:"id_account" db:"id_account"`
	Type           string    `json:"type" db:"type"` // system/reminder
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

type NotificationRepository interface {
	FindNotificationsByAccount(ctx context.Context, idAccount int) ([]*Notification, error)
	StoreNotification(ctx context.Context, n *Notification) error
	MarkNotificationRead(ctx context.Context, id int) error
}

type UseCase interface {
	GetMyNotifications(ctx context.Context, idAccount int) ([]*Notification, error)
	ReadNotification(ctx context.Context, id int) error
}
