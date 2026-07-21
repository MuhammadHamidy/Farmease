package usecase

import (
	"context"
)

func (u *useCase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
