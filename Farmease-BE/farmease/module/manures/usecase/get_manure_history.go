package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

// GetManureHistory retrieves historical manure logs for a single sheep ID.
func (u *useCase) GetManureHistory(ctx context.Context, idSheep string) ([]*domain.Manure, error) {
	return u.repo.FindHistoryBySheep(ctx, idSheep)
}

// GetManureHistoryByCage retrieves historical manure logs for a single cage ID.
func (u *useCase) GetManureHistoryByCage(ctx context.Context, idCage string) ([]*domain.Manure, error) {
	return u.repo.FindHistoryByCage(ctx, idCage)
}
