package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

func (u *useCase) GetWeightHistory(ctx context.Context, idSheep string) ([]*domain.Weight, error) {
	return u.repo.FindHistoryBySheep(ctx, idSheep)
}
