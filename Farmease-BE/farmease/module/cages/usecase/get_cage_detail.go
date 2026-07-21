package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (u *useCase) GetCageDetail(ctx context.Context, id string) (*domain.Cage, error) {
	return u.repo.FindByID(ctx, id)
}
