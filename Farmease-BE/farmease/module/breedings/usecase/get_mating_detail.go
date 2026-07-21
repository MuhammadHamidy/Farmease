package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

func (u *useCase) GetMatingDetail(ctx context.Context, id string) (*domain.Mating, error) {
	m, err := u.repo.FindByID(ctx, id)
	if err == nil && m != nil {
		m.CalculateDays()
	}
	return m, err
}
