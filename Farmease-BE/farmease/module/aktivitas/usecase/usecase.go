package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/aktivitas/domain"
)

type aktivitasUsecase struct {
	repo domain.AktivitasRepository
}

func NewAktivitasUsecase(repo domain.AktivitasRepository) domain.AktivitasUsecase {
	return &aktivitasUsecase{repo: repo}
}

func (u *aktivitasUsecase) FindAll(ctx context.Context) ([]domain.Aktivitas, error) {
	return u.repo.FindAll(ctx)
}

func (u *aktivitasUsecase) FindByID(ctx context.Context, id int) (*domain.Aktivitas, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *aktivitasUsecase) Create(ctx context.Context, a *domain.Aktivitas) error {
	return u.repo.Store(ctx, a)
}

func (u *aktivitasUsecase) Update(ctx context.Context, a *domain.Aktivitas) error {
	return u.repo.Update(ctx, a)
}

func (u *aktivitasUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
