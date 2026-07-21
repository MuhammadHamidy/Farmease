package usecase

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (u *useCase) GetBirthHistory(ctx context.Context, from, to *time.Time) ([]*domain.Birth, error) {
	return u.repo.FindAllBirths(ctx, from, to)
}
