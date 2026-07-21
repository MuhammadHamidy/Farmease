package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

func (u *useCase) UpdateHealth(ctx context.Context, id string, k *domain.Health) error {
	k.IDHealth = id
	return u.repo.Update(ctx, k)
}
