package usecase

import (
	"context"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/pembuahan/domain"
)

type pembuahanUsecase struct {
	repo domain.PembuahanRepository
	cfg  *config.InternalAppConfig
}

func NewPembuahanUsecase(repo domain.PembuahanRepository, cfg *config.InternalAppConfig) domain.PembuahanUsecase {
	return &pembuahanUsecase{repo: repo, cfg: cfg}
}

func (u *pembuahanUsecase) FindAll(ctx context.Context) ([]domain.Pembuahan, error) {
	return u.repo.FindAll(ctx)
}

func (u *pembuahanUsecase) FindByID(ctx context.Context, id string) (*domain.Pembuahan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pembuahanUsecase) Create(ctx context.Context, p *domain.Pembuahan) error {
	return u.repo.Store(ctx, p)
}

func (u *pembuahanUsecase) Update(ctx context.Context, p *domain.Pembuahan) error {
	return u.repo.Update(ctx, p)
}

func (u *pembuahanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

