package usecase

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (u *useCase) GetPregnancyList(ctx context.Context, status string) ([]*domain.Pregnancy, error) {
	list, err := u.repo.FindAllPregnancies(ctx, status)
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	for _, p := range list {
		if p.ExpectedBirthDate != nil {
			hours := p.ExpectedBirthDate.Sub(now).Hours()
			p.DaysRemaining = int((hours / 24.0) + 0.99)
		}
	}
	
	return list, nil
}
