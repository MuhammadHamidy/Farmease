package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

// RecordHealth creates and inserts a new sheep diagnostic health record into the repository.
func (u *useCase) RecordHealth(ctx context.Context, healthRecord *domain.Health) error {
	return u.repo.Store(ctx, healthRecord)
}
