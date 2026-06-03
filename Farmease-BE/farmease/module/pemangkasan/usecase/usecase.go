package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/pemangkasan/domain"
)

type pemangkasanUsecase struct {
	repo domain.PemangkasanRepository
}

func NewPemangkasanUsecase(repo domain.PemangkasanRepository) domain.PemangkasanUsecase {
	return &pemangkasanUsecase{repo: repo}
}

func (u *pemangkasanUsecase) FindAll(ctx context.Context) ([]domain.Pemangkasan, error) {
	return u.repo.FindAll(ctx)
}

func (u *pemangkasanUsecase) FindByID(ctx context.Context, id int) (*domain.Pemangkasan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *pemangkasanUsecase) Create(ctx context.Context, p *domain.Pemangkasan) error {
	return u.repo.Store(ctx, p)
}

func (u *pemangkasanUsecase) Update(ctx context.Context, p *domain.Pemangkasan) error {
	return u.repo.Update(ctx, p)
}

func (u *pemangkasanUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
