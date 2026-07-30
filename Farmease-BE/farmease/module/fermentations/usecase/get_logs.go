package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
)

// GetLogs lists all checking history entries related to a fermentation conversion ID.
func (u *useCase) GetLogs(ctx context.Context, conversionID string) ([]*domain.SilageFermentationLog, error) {
	return u.repo.FindLogsByConversionID(ctx, conversionID)
}
