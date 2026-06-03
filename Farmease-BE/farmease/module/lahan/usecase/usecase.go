package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/lahan/domain"
)

type lahanUsecase struct {
	repo domain.LahanRepository
}

func NewLahanUsecase(repo domain.LahanRepository) domain.LahanUsecase {
	return &lahanUsecase{repo: repo}
}

func (u *lahanUsecase) FindAll(ctx context.Context) ([]domain.Lahan, error) {
	return u.repo.FindAll(ctx)
}

func (u *lahanUsecase) FindByID(ctx context.Context, id int) (*domain.Lahan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *lahanUsecase) Create(ctx context.Context, l *domain.Lahan) error {
	return u.repo.Store(ctx, l)
}

func (u *lahanUsecase) Update(ctx context.Context, l *domain.Lahan) error {
	return u.repo.Update(ctx, l)
}

func (u *lahanUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}

func (u *lahanUsecase) FindByKodeLahan(ctx context.Context, kode string) (*domain.Lahan, error) {
	return u.repo.FindByKodeLahan(ctx, kode)
}
