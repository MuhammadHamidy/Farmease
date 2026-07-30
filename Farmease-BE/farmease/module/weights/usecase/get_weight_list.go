package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

// GetWeightList retrieves a paginated list of weight records based on search filters.
func (u *useCase) GetWeightList(ctx context.Context, filter domain.WeightFilter) ([]*domain.Weight, int, error) {
	return u.repo.FindAll(ctx, filter)
}
