package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/panen/domain"
)

type panenUsecase struct {
	repo domain.PanenRepository
}

func NewPanenUsecase(repo domain.PanenRepository) domain.PanenUsecase {
	return &panenUsecase{repo: repo}
}

func (u *panenUsecase) FindAll(ctx context.Context) ([]domain.Panen, error) {
	return u.repo.FindAll(ctx)
}

func (u *panenUsecase) FindByID(ctx context.Context, id int) (*domain.Panen, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *panenUsecase) FindRekap(ctx context.Context) ([]domain.PanenRekap, error) {
	return u.repo.FindRekap(ctx)
}

func (u *panenUsecase) Create(ctx context.Context, p *domain.Panen) error {
	return u.repo.Store(ctx, p)
}

func (u *panenUsecase) Update(ctx context.Context, p *domain.Panen) error {
	return u.repo.Update(ctx, p)
}

func (u *panenUsecase) Delete(ctx context.Context, id int) error {
	return u.repo.Delete(ctx, id)
}
