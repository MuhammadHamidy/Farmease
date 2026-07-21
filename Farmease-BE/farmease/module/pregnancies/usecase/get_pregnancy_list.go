package usecase

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

// GetPregnancyList retrieves all ongoing pregnancy records and calculates the remaining gestational days.
func (u *useCase) GetPregnancyList(ctx context.Context, status string) ([]*domain.Pregnancy, error) {
	pregnancyList, err := u.repo.FindAllPregnancies(ctx, status)
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	for _, pregnancy := range pregnancyList {
		if pregnancy.ExpectedBirthDate != nil {
			hours := pregnancy.ExpectedBirthDate.Sub(now).Hours()
			pregnancy.DaysRemaining = int((hours / 24.0) + 0.99)
		}
	}
	
	return pregnancyList, nil
}
