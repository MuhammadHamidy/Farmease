package usecase

import (
	"context"
)

// DeleteSubmission cancels/deletes a pending or rejected submission log.
func (u *useCase) DeleteSubmission(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
