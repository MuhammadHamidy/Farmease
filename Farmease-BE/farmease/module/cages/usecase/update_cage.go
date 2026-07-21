package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (u *useCase) UpdateCage(ctx context.Context, id string, cage *domain.Cage) error {
	cage.IDCage = id
	return u.repo.Update(ctx, cage)
}
