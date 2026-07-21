package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

// GetMatingDetail fetches a breeding record by ID and updates its days calculation.
func (u *useCase) GetMatingDetail(ctx context.Context, id string) (*domain.Mating, error) {
	mating, err := u.repo.FindByID(ctx, id)
	if err == nil && mating != nil {
		mating.CalculateDays()
	}
	return mating, err
}
