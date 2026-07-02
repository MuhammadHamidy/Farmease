package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/config"
	"github.com/farmease/farmease-be/farmease/module/penyiraman/domain"
)

type penyiramanUsecase struct {
	repo domain.PenyiramanRepository
	cfg  *config.InternalAppConfig
}

func NewPenyiramanUsecase(repo domain.PenyiramanRepository, cfg *config.InternalAppConfig) domain.PenyiramanUsecase {
	return &penyiramanUsecase{repo: repo, cfg: cfg}
}

func (u *penyiramanUsecase) FindAll(ctx context.Context) ([]domain.Penyiraman, error) {
	return u.repo.FindAll(ctx)
}

func (u *penyiramanUsecase) FindByID(ctx context.Context, id string) (*domain.Penyiraman, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *penyiramanUsecase) Create(ctx context.Context, p *domain.Penyiraman) error {
	return u.repo.Store(ctx, p)
}

func (u *penyiramanUsecase) Update(ctx context.Context, p *domain.Penyiraman) error {
	return u.repo.Update(ctx, p)
}

func (u *penyiramanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
