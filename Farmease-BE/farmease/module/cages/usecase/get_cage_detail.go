package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// GetCageDetail retrieves structural details of a specific cage by ID.
func (u *useCase) GetCageDetail(ctx context.Context, id string) (*domain.Cage, error) {
	return u.repo.FindByID(ctx, id)
}
