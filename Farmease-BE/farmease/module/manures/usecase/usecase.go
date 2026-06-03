package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

type useCase struct {
	repo domain.ManureRepository
}

func NewUseCase(repo domain.ManureRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetManureList(ctx context.Context, filter domain.ManureFilter) ([]*domain.Manure, int, error) {
	return u.repo.FindAll(ctx, filter)
}

func (u *useCase) GetManureHistory(ctx context.Context, idSheep int) ([]*domain.Manure, error) {
	return u.repo.FindHistoryBySheep(ctx, idSheep)
}

func (u *useCase) RecordManure(ctx context.Context, m *domain.Manure) error {
	return u.repo.Store(ctx, m)
}
