package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (u *useCase) GetCageWeightStats(ctx context.Context, id string) (*domain.CageWeightStats, error) {
	return u.repo.GetCageWeightStats(ctx, id)
}
