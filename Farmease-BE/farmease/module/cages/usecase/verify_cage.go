package usecase

import (
	"context"
	"errors"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (u *useCase) VerifyCage(ctx context.Context, code string) (*domain.Cage, error) {
	cage, err := u.repo.FindByCode(ctx, code)
	if err != nil {
		return nil, errors.New("cage code is invalid or not found")
	}
	return cage, nil
}
