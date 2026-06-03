package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

type useCase struct {
	repo domain.HealthRepository
}

func NewUseCase(repo domain.HealthRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetHealthList(ctx context.Context, filter domain.HealthFilter) ([]*domain.Health, int, error) {
	return u.repo.FindAll(ctx, filter)
}

func (u *useCase) GetHealthHistory(ctx context.Context, idSheep int) ([]*domain.Health, error) {
	return u.repo.FindHistoryBySheep(ctx, idSheep)
}

func (u *useCase) RecordHealth(ctx context.Context, k *domain.Health) error {
	return u.repo.Store(ctx, k)
}

func (u *useCase) UpdateHealth(ctx context.Context, id int, k *domain.Health) error {
	k.IDHealth = id
	return u.repo.Update(ctx, k)
}
