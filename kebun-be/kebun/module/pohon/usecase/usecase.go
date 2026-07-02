package usecase

import (
	"context"
	"errors"

	"github.com/farmease/farmease-be/farmease/module/pohon/domain"
)

type pohonUsecase struct {
	repo domain.PohonRepository
}

func NewPohonUsecase(repo domain.PohonRepository) domain.PohonUsecase {
	return &pohonUsecase{repo: repo}
}

func isValidFasePohon(f string) bool {
	switch domain.FasePohon(f) {
	case domain.FasePohonPembibitan, domain.FasePohonVegetatif, domain.FasePohonGeneratif, domain.FasePohonPanen, domain.FasePohonTidakProduktif:
		return true
	}
	return false
}

func (u *pohonUsecase) FindAll(ctx context.Context) ([]domain.Pohon, error) {
	return u.repo.FindAll(ctx)
}

func (u *pohonUsecase) FindByID(ctx context.Context, id string) (*domain.Pohon, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pohonUsecase) Create(ctx context.Context, p *domain.Pohon) error {
	if !isValidFasePohon(p.FasePohon) {
		return errors.New("fase_pohon tidak valid: harus Pembibitan, Vegetatif, Generatif, Panen, atau Tidak Produktif")
	}
	return u.repo.Store(ctx, p)
}

func (u *pohonUsecase) Update(ctx context.Context, p *domain.Pohon) error {
	if !isValidFasePohon(p.FasePohon) {
		return errors.New("fase_pohon tidak valid: harus Pembibitan, Vegetatif, Generatif, Panen, atau Tidak Produktif")
	}
	return u.repo.Update(ctx, p)
}

func (u *pohonUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
