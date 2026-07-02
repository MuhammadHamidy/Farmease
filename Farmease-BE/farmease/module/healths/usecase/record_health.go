package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

func (u *useCase) RecordHealth(ctx context.Context, k *domain.Health) error {
	return u.repo.Store(ctx, k)
}
