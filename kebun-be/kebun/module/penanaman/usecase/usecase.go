package usecase

import (
	"context"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/penanaman/domain"
)

type penanamanUsecase struct {
	repo domain.PenanamanRepository
	cfg  *config.InternalAppConfig
}

func NewPenanamanUsecase(repo domain.PenanamanRepository, cfg *config.InternalAppConfig) domain.PenanamanUsecase {
	return &penanamanUsecase{repo: repo, cfg: cfg}
}

func (u *penanamanUsecase) FindAll(ctx context.Context) ([]domain.Penanaman, error) {
	return u.repo.FindAll(ctx)
}

func (u *penanamanUsecase) FindByID(ctx context.Context, id string) (*domain.Penanaman, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *penanamanUsecase) Create(ctx context.Context, p *domain.Penanaman) error {
	return u.repo.Store(ctx, p)
}

func (u *penanamanUsecase) Update(ctx context.Context, p *domain.Penanaman) error {
	return u.repo.Update(ctx, p)
}

func (u *penanamanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

