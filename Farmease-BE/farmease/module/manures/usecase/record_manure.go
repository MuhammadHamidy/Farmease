package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (u *useCase) RecordManure(ctx context.Context, m *domain.Manure) error {
	return u.repo.Store(ctx, m)
}
