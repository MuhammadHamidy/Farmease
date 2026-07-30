package usecase

import (
	"context"
)

// UpdateMatingStatus modifies the breeding session status and records review notes.
func (u *useCase) UpdateMatingStatus(ctx context.Context, id string, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}
