package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/pohon/domain"
)

type pohonUsecase struct {
	repo domain.PohonRepository
}

func NewPohonUsecase(repo domain.PohonRepository) domain.PohonUsecase {
	return &pohonUsecase{repo: repo}
}

func (u *pohonUsecase) FindAll(ctx context.Context) ([]domain.Pohon, error) {
	return u.repo.FindAll(ctx)
}

func (u *pohonUsecase) FindByID(ctx context.Context, id int) (*domain.Pohon, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pohonUsecase) Create(ctx context.Context, p *domain.Pohon) error {
	return u.repo.Store(ctx, p)
}

func (u *pohonUsecase) Update(ctx context.Context, p *domain.Pohon) error {
	return u.repo.Update(ctx, p)
}

func (u *pohonUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
