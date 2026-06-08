package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

type useCase struct {
	repo domain.SheepRepository
}

func NewUseCase(repo domain.SheepRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetSheepList(ctx context.Context, filter domain.SheepFilter) ([]*domain.Sheep, int, error) {
	sheepList, total, err := u.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	// Calculate age and ADG for each sheep
	for _, sheep := range sheepList {
		sheep.CalculateAge()
		sheep.CalculateADG()
	}

	return sheepList, total, nil
}

func (u *useCase) RegisterSheep(ctx context.Context, sheep *domain.Sheep) error {
	return u.repo.Store(ctx, sheep)
}

func (u *useCase) GetSheepDetail(ctx context.Context, id int) (*domain.Sheep, error) {
	sheep, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Calculate age and ADG
	sheep.CalculateAge()
	sheep.CalculateADG()

	return sheep, nil
}

func (u *useCase) UpdateSheep(ctx context.Context, id int, sheep *domain.Sheep) error {
	sheep.IDSheep = id
	return u.repo.Update(ctx, sheep)
}

func (u *useCase) UpdateSheepStatus(ctx context.Context, id int, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}

func (u *useCase) GetSheepGenealogy(ctx context.Context, id int, generation int) (*domain.Genealogy, error) {
	if generation <= 0 {
		generation = 3
	}
	if generation > 5 {
		generation = 5
	}
	return u.repo.GetGenealogy(ctx, id, generation)
}

func (u *useCase) GetSheepTypeList(ctx context.Context) ([]*domain.SheepType, error) {
	return u.repo.FindAllTypes(ctx)
}

func (u *useCase) AddSheepType(ctx context.Context, t *domain.SheepType) error {
	return u.repo.StoreType(ctx, t)
}

func (u *useCase) UpdateSheepType(ctx context.Context, id int, t *domain.SheepType) error {
	return u.repo.UpdateType(ctx, id, t)
}
