package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

func (u *useCase) GetHealthList(ctx context.Context, filter domain.HealthFilter) ([]*domain.Health, int, error) {
	return u.repo.FindAll(ctx, filter)
}
