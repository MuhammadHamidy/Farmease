package usecase

import (
	"context"
	"errors"

	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

type useCase struct {
	repo domain.CageRepository
}

func NewUseCase(repo domain.CageRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetCageList(ctx context.Context, filter domain.CageFilter) ([]*domain.Cage, int, error) {
	return u.repo.FindAll(ctx, filter)
}

func (u *useCase) CreateCage(ctx context.Context, cage *domain.Cage) error {
	return u.repo.Store(ctx, cage)
}

func (u *useCase) GetCageDetail(ctx context.Context, id int) (*domain.Cage, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *useCase) UpdateCage(ctx context.Context, id int, cage *domain.Cage) error {
	cage.IDCage = id
	return u.repo.Update(ctx, cage)
}

func (u *useCase) DeleteCage(ctx context.Context, id int) error {
	count, err := u.repo.GetOccupancy(ctx, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("cage cannot be deleted because it still contains sheep")
	}
	return u.repo.Delete(ctx, id)
}

func (u *useCase) VerifyCage(ctx context.Context, code string) (*domain.Cage, error) {
	cage, err := u.repo.FindByCode(ctx, code)
	if err != nil {
		return nil, errors.New("cage code is invalid or not found")
	}
	return cage, nil
}

func (u *useCase) GetCageStats(ctx context.Context, id int) (*domain.CageStats, error) {
	return u.repo.GetCageStats(ctx, id)
}

func (u *useCase) GetCageWeightStats(ctx context.Context, id int) (*domain.CageWeightStats, error) {
	return u.repo.GetCageWeightStats(ctx, id)
}
