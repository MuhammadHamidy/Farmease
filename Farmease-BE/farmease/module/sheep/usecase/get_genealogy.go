package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) GetSheepGenealogy(ctx context.Context, id string, generation int) (*domain.Genealogy, error) {
	if generation <= 0 {
		generation = 3
	}
	if generation > 5 {
		generation = 5
	}
	return u.repo.GetGenealogy(ctx, id, generation)
}
