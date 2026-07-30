package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// GetCageWeightStats compiles weight progress metrics (e.g. average, target weight differences) for a specific cage.
func (u *useCase) GetCageWeightStats(ctx context.Context, id string) (*domain.CageWeightStats, error) {
	return u.repo.GetCageWeightStats(ctx, id)
}
