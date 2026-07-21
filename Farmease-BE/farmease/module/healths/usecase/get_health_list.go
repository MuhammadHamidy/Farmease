package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

// GetHealthList fetches a paginated list of health records based on standard search/status filters.
func (u *useCase) GetHealthList(ctx context.Context, filter domain.HealthFilter) ([]*domain.Health, int, error) {
	return u.repo.FindAll(ctx, filter)
}
