package usecase

import (
	"context"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/stok/domain"
)

type stokUsecase struct {
	repo domain.StokRepository
	cfg  *config.InternalAppConfig
}

func NewStokUsecase(repo domain.StokRepository, cfg *config.InternalAppConfig) domain.StokUsecase {
	return &stokUsecase{repo: repo, cfg: cfg}
}

// === BAHAN ===

func (u *stokUsecase) FindAllBahan(ctx context.Context) ([]*domain.StokBahan, error) {
	return u.repo.FindAllBahan(ctx)
}

func (u *stokUsecase) StoreBahan(ctx context.Context, s *domain.StokBahan) error {
	return u.repo.StoreBahan(ctx, s)
}

func (u *stokUsecase) UpdateBahanStock(ctx context.Context, id string, amount float64, typeAction string) error {
	return u.repo.UpdateBahanStock(ctx, id, amount, typeAction)
}

// === PUPUK ===

func (u *stokUsecase) FindAllPupuk(ctx context.Context) ([]*domain.StokPupuk, error) {
	return u.repo.FindAllPupuk(ctx)
}

func (u *stokUsecase) StorePupuk(ctx context.Context, s *domain.StokPupuk) error {
	return u.repo.StorePupuk(ctx, s)
}

func (u *stokUsecase) UpdatePupukStock(ctx context.Context, id string, amount float64, typeAction string) error {
	return u.repo.UpdatePupukStock(ctx, id, amount, typeAction)
}

// === OBAT ===

func (u *stokUsecase) FindAllObat(ctx context.Context) ([]*domain.StokObat, error) {
	return u.repo.FindAllObat(ctx)
}

func (u *stokUsecase) StoreObat(ctx context.Context, s *domain.StokObat) error {
	return u.repo.StoreObat(ctx, s)
}

func (u *stokUsecase) UpdateObatStock(ctx context.Context, id string, amount float64, typeAction string) error {
	return u.repo.UpdateObatStock(ctx, id, amount, typeAction)
}

