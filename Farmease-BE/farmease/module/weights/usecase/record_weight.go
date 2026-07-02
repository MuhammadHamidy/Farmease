package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

func (u *useCase) RecordWeight(ctx context.Context, w *domain.Weight) error {
	return u.repo.Store(ctx, w)
}
