package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

func (u *useCase) GetHealthHistory(ctx context.Context, idSheep string) ([]*domain.Health, error) {
	return u.repo.FindHistoryBySheep(ctx, idSheep)
}
