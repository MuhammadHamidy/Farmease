package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (u *useCase) GetCageList(ctx context.Context, filter domain.CageFilter) ([]*domain.Cage, int, error) {
	return u.repo.FindAll(ctx, filter)
}
