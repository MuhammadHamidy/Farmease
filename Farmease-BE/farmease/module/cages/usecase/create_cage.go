package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// CreateCage inserts a new cage record into the database.
func (u *useCase) CreateCage(ctx context.Context, cage *domain.Cage) error {
	return u.repo.Store(ctx, cage)
}
