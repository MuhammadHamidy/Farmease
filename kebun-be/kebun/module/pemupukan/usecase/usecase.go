package usecase

import (
	"context"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/pemupukan/domain"
)

type pemupukanUsecase struct {
	repo domain.PemupukanRepository
	cfg  *config.InternalAppConfig
}

func NewPemupukanUsecase(repo domain.PemupukanRepository, cfg *config.InternalAppConfig) domain.PemupukanUsecase {
	return &pemupukanUsecase{repo: repo, cfg: cfg}
}

func (u *pemupukanUsecase) FindAll(ctx context.Context) ([]*domain.Pemupukan, error) {
	return u.repo.FindAll(ctx)
}

func (u *pemupukanUsecase) FindByID(ctx context.Context, id string) (*domain.Pemupukan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pemupukanUsecase) Create(ctx context.Context, p *domain.Pemupukan) error {
	return u.repo.Store(ctx, p)
}

func (u *pemupukanUsecase) Update(ctx context.Context, p *domain.Pemupukan) error {
	return u.repo.Update(ctx, p)
}

func (u *pemupukanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

