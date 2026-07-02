package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (u *useCase) CreateCage(ctx context.Context, cage *domain.Cage) error {
	return u.repo.Store(ctx, cage)
}
