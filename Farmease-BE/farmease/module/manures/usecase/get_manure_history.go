package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (u *useCase) GetManureHistory(ctx context.Context, idSheep string) ([]*domain.Manure, error) {
	return u.repo.FindHistoryBySheep(ctx, idSheep)
}

func (u *useCase) GetManureHistoryByCage(ctx context.Context, idCage string) ([]*domain.Manure, error) {
	return u.repo.FindHistoryByCage(ctx, idCage)
}
