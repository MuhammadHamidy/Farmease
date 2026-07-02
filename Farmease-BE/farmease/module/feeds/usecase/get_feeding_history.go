package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) GetFeedingHistory(ctx context.Context, idSheep string) ([]*domain.Feeding, error) {
	return u.repo.FindFeedingHistory(ctx, idSheep)
}
