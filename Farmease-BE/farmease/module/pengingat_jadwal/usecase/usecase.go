package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/pengingat_jadwal/domain"
)

type pengingatJadwalUsecase struct {
	repo domain.PengingatJadwalRepository
}

func NewPengingatJadwalUsecase(repo domain.PengingatJadwalRepository) domain.PengingatJadwalUsecase {
	return &pengingatJadwalUsecase{repo: repo}
}

func (u *pengingatJadwalUsecase) FindAll(ctx context.Context) ([]domain.PengingatJadwal, error) {
	return u.repo.FindAll(ctx)
}

func (u *pengingatJadwalUsecase) FindByID(ctx context.Context, id int) (*domain.PengingatJadwal, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pengingatJadwalUsecase) Create(ctx context.Context, pj *domain.PengingatJadwal) error {
	return u.repo.Store(ctx, pj)
}

func (u *pengingatJadwalUsecase) Update(ctx context.Context, pj *domain.PengingatJadwal) error {
	return u.repo.Update(ctx, pj)
}

func (u *pengingatJadwalUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
