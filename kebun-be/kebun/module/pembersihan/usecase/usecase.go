package usecase

import (
	"context"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/pembersihan/domain"
)

type pembersihanUsecase struct {
	repo domain.PembersihanRepository
	cfg  *config.InternalAppConfig
}

func NewPembersihanUsecase(repo domain.PembersihanRepository, cfg *config.InternalAppConfig) domain.PembersihanUsecase {
	return &pembersihanUsecase{repo: repo, cfg: cfg}
}

func (u *pembersihanUsecase) FindAll(ctx context.Context) ([]domain.Pembersihan, error) {
	return u.repo.FindAll(ctx)
}

func (u *pembersihanUsecase) FindByID(ctx context.Context, id string) (*domain.Pembersihan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pembersihanUsecase) Create(ctx context.Context, p *domain.Pembersihan) error {
	return u.repo.Store(ctx, p)
}

func (u *pembersihanUsecase) Update(ctx context.Context, p *domain.Pembersihan) error {
	return u.repo.Update(ctx, p)
}

func (u *pembersihanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

