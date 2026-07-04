package usecase

import (
	"context"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/fermentasi/domain"
)

type fermentasiUsecase struct {
	repo domain.FermentasiRepository
	cfg  *config.InternalAppConfig
}

func NewFermentasiUsecase(repo domain.FermentasiRepository, cfg *config.InternalAppConfig) domain.FermentasiUsecase {
	return &fermentasiUsecase{repo: repo, cfg: cfg}
}

func (u *fermentasiUsecase) FindAll(ctx context.Context) ([]*domain.Fermentasi, error) {
	return u.repo.FindAll(ctx)
}

func (u *fermentasiUsecase) FindByID(ctx context.Context, id string) (*domain.Fermentasi, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *fermentasiUsecase) CreatePupukFermentasi(ctx context.Context, f *domain.Fermentasi) error {
	f.Status = "proses"
	return u.repo.Store(ctx, f)
}

func (u *fermentasiUsecase) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}

func (u *fermentasiUsecase) AddLog(ctx context.Context, l *domain.LogFermentasi) error {
	return u.repo.StoreLog(ctx, l)
}

