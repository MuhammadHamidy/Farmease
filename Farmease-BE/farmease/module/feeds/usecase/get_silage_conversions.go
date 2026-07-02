package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) GetSilageConversions(ctx context.Context) ([]*domain.SilageConversion, error) {
	return u.repo.FindAllSilageConversions(ctx)
}
