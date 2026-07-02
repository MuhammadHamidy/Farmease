package usecase

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/config"
	"github.com/farmease/farmease-be/farmease/module/pengobatan/domain"
)

type pengobatanUsecase struct {
	repo domain.PengobatanRepository
	cfg  *config.InternalAppConfig
}

func NewPengobatanUsecase(repo domain.PengobatanRepository, cfg *config.InternalAppConfig) domain.PengobatanUsecase {
	return &pengobatanUsecase{repo: repo, cfg: cfg}
}

func (u *pengobatanUsecase) FindAll(ctx context.Context) ([]domain.Pengobatan, error) {
	return u.repo.FindAll(ctx)
}

func (u *pengobatanUsecase) FindByID(ctx context.Context, id string) (*domain.Pengobatan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pengobatanUsecase) Create(ctx context.Context, p *domain.Pengobatan) error {
	return u.repo.Store(ctx, p)
}

func (u *pengobatanUsecase) Update(ctx context.Context, p *domain.Pengobatan) error {
	return u.repo.Update(ctx, p)
}

func (u *pengobatanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *pengobatanUsecase) GetRekomendasiObat(ctx context.Context, varietas, fase, obat string) (string, error) {
	if varietas == "" {
		varietas = "Alpukat Aligator"
	}
	if fase == "" || fase == "Fase Pohon" {
		fase = "Vegetatif"
	}
	if obat == "" {
		obat = "Ekstrak Nimba"
	}
	return fmt.Sprintf("Varietas <strong>%s</strong> dengan fase <strong>%s</strong> menggunakan <strong>%s</strong> dengan dosis sebanyak <strong>2-3 mL/Liter air</strong>.", varietas, fase, obat), nil
}
