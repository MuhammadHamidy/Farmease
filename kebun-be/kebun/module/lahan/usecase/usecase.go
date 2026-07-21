package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/farmease/kebun-be/kebun/module/lahan/domain"
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

func (u *lahanUsecase) FindByID(ctx context.Context, id string) (*domain.Lahan, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *lahanUsecase) Create(ctx context.Context, l *domain.Lahan) error {
	l.KodeLahan = strings.ToUpper(strings.TrimSpace(l.KodeLahan))
	existing, err := u.repo.FindByKodeLahan(ctx, l.KodeLahan)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("kode lahan sudah digunakan")
	}
	return u.repo.Store(ctx, l)
}

func (u *lahanUsecase) Update(ctx context.Context, l *domain.Lahan) error {
	l.KodeLahan = strings.ToUpper(strings.TrimSpace(l.KodeLahan))
	existing, err := u.repo.FindByKodeLahan(ctx, l.KodeLahan)
	if err != nil {
		return err
	}
	if existing != nil && existing.IDLahan != l.IDLahan {
		return errors.New("kode lahan sudah digunakan oleh lahan lain")
	}
	return u.repo.Update(ctx, l)
}

func (u *lahanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *lahanUsecase) FindByKodeLahan(ctx context.Context, kode string) (*domain.Lahan, error) {
	return u.repo.FindByKodeLahan(ctx, kode)
}

