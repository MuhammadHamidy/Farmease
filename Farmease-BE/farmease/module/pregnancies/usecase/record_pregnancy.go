package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (u *useCase) RecordPregnancy(ctx context.Context, k *domain.Pregnancy) error {
	return u.repo.StorePregnancy(ctx, k)
}
