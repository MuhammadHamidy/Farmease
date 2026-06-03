package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/notifikasi/domain"
)

type notifikasiUsecase struct {
	repo domain.NotifikasiRepository
}

func NewNotifikasiUsecase(repo domain.NotifikasiRepository) domain.NotifikasiUsecase {
	return &notifikasiUsecase{repo: repo}
}

func (u *notifikasiUsecase) FindAll(ctx context.Context) ([]domain.Notifikasi, error) {
	return u.repo.FindAll(ctx)
}

func (u *notifikasiUsecase) FindByID(ctx context.Context, id int) (*domain.Notifikasi, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *notifikasiUsecase) Create(ctx context.Context, n *domain.Notifikasi) error {
	return u.repo.Store(ctx, n)
}

func (u *notifikasiUsecase) Update(ctx context.Context, n *domain.Notifikasi) error {
	return u.repo.Update(ctx, n)
}

func (u *notifikasiUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
