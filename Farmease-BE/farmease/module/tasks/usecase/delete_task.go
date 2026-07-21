package usecase

import (
	"context"
)

// DeleteTask removes an assigned task from database.
func (u *useCase) DeleteTask(ctx context.Context, id string) error {
	return u.repo.DeleteTask(ctx, id)
}
