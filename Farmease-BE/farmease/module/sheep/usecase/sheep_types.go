package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) GetSheepTypeList(ctx context.Context) ([]*domain.SheepType, error) {
	return u.repo.FindAllTypes(ctx)
}

func (u *useCase) AddSheepType(ctx context.Context, t *domain.SheepType) error {
	return u.repo.StoreType(ctx, t)
}

func (u *useCase) UpdateSheepType(ctx context.Context, id string, t *domain.SheepType) error {
	return u.repo.UpdateType(ctx, id, t)
}
