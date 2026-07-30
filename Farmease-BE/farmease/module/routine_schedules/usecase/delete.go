package usecase

import (
	"context"
)

// Delete removes a routine schedule from database.
func (u *useCase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
