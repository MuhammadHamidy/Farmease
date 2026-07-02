package usecase

import (
	"context"
)

func (u *useCase) ReadNotification(ctx context.Context, id string) error {
	return u.repo.MarkNotificationRead(ctx, id)
}
