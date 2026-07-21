package usecase

import (
	"context"
)

func (u *useCase) DeleteTask(ctx context.Context, id string) error {
	return u.repo.DeleteTask(ctx, id)
}
