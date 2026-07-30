package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

// RecordWeight saves a new sheep weight measurement into the repository.
func (u *useCase) RecordWeight(ctx context.Context, weightRecord *domain.Weight) error {
	return u.repo.Store(ctx, weightRecord)
}
