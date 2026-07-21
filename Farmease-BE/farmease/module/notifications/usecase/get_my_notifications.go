package usecase

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
)

func (u *useCase) GetMyNotifications(ctx context.Context, idAccount string) ([]*domain.Notification, error) {
	// Dynamically generate reminders on the fly
	_ = u.repo.GenerateDynamicReminders(ctx, idAccount, time.Now())

	return u.repo.FindNotificationsByAccount(ctx, idAccount)
}
