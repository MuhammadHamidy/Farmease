package usecase

import (
	"context"
)

func (u *useCase) UpdateMatingStatus(ctx context.Context, id string, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}
