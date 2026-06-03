package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/akun_lahan/domain"
)

type akunLahanUsecase struct {
	repo domain.AkunLahanRepository
}

func NewAkunLahanUsecase(repo domain.AkunLahanRepository) domain.AkunLahanUsecase {
	return &akunLahanUsecase{repo: repo}
}

func (u *akunLahanUsecase) FindAll(ctx context.Context) ([]domain.AkunLahan, error) {
	return u.repo.FindAll(ctx)
}

func (u *akunLahanUsecase) FindByID(ctx context.Context, id int) (*domain.AkunLahan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *akunLahanUsecase) Create(ctx context.Context, al *domain.AkunLahan) error {
	return u.repo.Store(ctx, al)
}

func (u *akunLahanUsecase) Update(ctx context.Context, al *domain.AkunLahan) error {
	return u.repo.Update(ctx, al)
}

func (u *akunLahanUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
