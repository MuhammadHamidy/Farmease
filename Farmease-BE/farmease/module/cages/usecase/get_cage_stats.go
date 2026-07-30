package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// GetCageStats gathers statistical metrics (e.g. population, types distribution) for a specific cage.
func (u *useCase) GetCageStats(ctx context.Context, id string) (*domain.CageStats, error) {
	return u.repo.GetCageStats(ctx, id)
}
