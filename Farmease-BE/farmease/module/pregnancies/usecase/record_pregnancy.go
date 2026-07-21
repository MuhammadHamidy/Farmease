package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

// RecordPregnancy creates and registers a pregnancy record.
func (u *useCase) RecordPregnancy(ctx context.Context, pregnancy *domain.Pregnancy) error {
	return u.repo.StorePregnancy(ctx, pregnancy)
}
