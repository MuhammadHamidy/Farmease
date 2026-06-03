package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

type useCase struct {
	repo domain.WeightRepository
}

func NewUseCase(repo domain.WeightRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetWeightList(ctx context.Context, filter domain.WeightFilter) ([]*domain.Weight, int, error) {
	return u.repo.FindAll(ctx, filter)
}

func (u *useCase) GetWeightHistory(ctx context.Context, idSheep int) ([]*domain.Weight, error) {
	return u.repo.FindHistoryBySheep(ctx, idSheep)
}

func (u *useCase) RecordWeight(ctx context.Context, w *domain.Weight) error {
	return u.repo.Store(ctx, w)
}
