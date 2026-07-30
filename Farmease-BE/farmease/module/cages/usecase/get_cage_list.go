package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// GetCageList retrieves a list of all registered cages matching the search filters.
func (u *useCase) GetCageList(ctx context.Context, filter domain.CageFilter) ([]*domain.Cage, int, error) {
	return u.repo.FindAll(ctx, filter)
}
