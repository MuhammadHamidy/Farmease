package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/jadwal_rutin/domain"
)

type jadwalRutinUsecase struct {
	repo domain.JadwalRutinRepository
}

func NewJadwalRutinUsecase(repo domain.JadwalRutinRepository) domain.JadwalRutinUsecase {
	return &jadwalRutinUsecase{repo: repo}
}

func (u *jadwalRutinUsecase) FindAll(ctx context.Context) ([]domain.JadwalRutin, error) {
	return u.repo.FindAll(ctx)
}

func (u *jadwalRutinUsecase) FindByID(ctx context.Context, id int) (*domain.JadwalRutin, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *jadwalRutinUsecase) Create(ctx context.Context, pj *domain.JadwalRutin) error {
	return u.repo.Store(ctx, pj)
}

func (u *jadwalRutinUsecase) Update(ctx context.Context, pj *domain.JadwalRutin) error {
	return u.repo.Update(ctx, pj)
}

func (u *jadwalRutinUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
