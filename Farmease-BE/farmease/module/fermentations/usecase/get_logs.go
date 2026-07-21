package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
)

func (u *useCase) GetLogs(ctx context.Context, conversionID string) ([]*domain.SilageFermentationLog, error) {
	return u.repo.FindLogsByConversionID(ctx, conversionID)
}
