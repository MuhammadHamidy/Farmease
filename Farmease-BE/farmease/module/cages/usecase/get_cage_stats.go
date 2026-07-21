package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (u *useCase) GetCageStats(ctx context.Context, id string) (*domain.CageStats, error) {
	return u.repo.GetCageStats(ctx, id)
}
