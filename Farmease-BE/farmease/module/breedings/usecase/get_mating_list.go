package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

// GetMatingList retrieves mating records from the repository and updates active breeding day counts.
func (u *useCase) GetMatingList(ctx context.Context, status string, inbreedingFlag *bool) ([]*domain.Mating, error) {
	matingList, err := u.repo.FindAll(ctx, status, inbreedingFlag)
	if err == nil {
		for _, mating := range matingList {
			mating.CalculateDays()
		}
	}
	return matingList, err
}
