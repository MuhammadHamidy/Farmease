package usecase

import (
	"context"
	"errors"
)

func (u *useCase) DeleteCage(ctx context.Context, id string) error {
	count, err := u.repo.GetOccupancy(ctx, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("cage cannot be deleted because it still contains sheep")
	}
	return u.repo.Delete(ctx, id)
}
