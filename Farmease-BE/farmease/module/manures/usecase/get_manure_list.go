package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

// GetManureList retrieves a list of manure collection/distribution logs.
func (u *useCase) GetManureList(ctx context.Context, filter domain.ManureFilter) ([]*domain.Manure, int, error) {
	return u.repo.FindAll(ctx, filter)
}
