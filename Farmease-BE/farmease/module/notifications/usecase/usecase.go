package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
)

type useCase struct {
	repo domain.NotificationRepository
}

func NewUseCase(repo domain.NotificationRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetMyNotifications(ctx context.Context, idAccount int) ([]*domain.Notification, error) {
	return u.repo.FindNotificationsByAccount(ctx, idAccount)
}

func (u *useCase) ReadNotification(ctx context.Context, id int) error {
	return u.repo.MarkNotificationRead(ctx, id)
}
