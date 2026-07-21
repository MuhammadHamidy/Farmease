package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

func (u *useCase) GetMatingList(ctx context.Context, status string, inbreedingFlag *bool) ([]*domain.Mating, error) {
	list, err := u.repo.FindAll(ctx, status, inbreedingFlag)
	if err == nil {
		for _, m := range list {
			m.CalculateDays()
		}
	}
	return list, err
}
