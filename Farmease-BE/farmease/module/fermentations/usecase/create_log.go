package usecase

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
)

func (u *useCase) CreateLog(ctx context.Context, log *domain.SilageFermentationLog) error {
	// 1. Store the new log
	if err := u.repo.StoreLog(ctx, log); err != nil {
		return fmt.Errorf("failed to save fermentation log: %w", err)
	}

	// 2. If status is 'siap', increase target stock in warehouse
	if log.Status == "siap" {
		targetFeedID, targetAmount, err := u.repo.GetConversionTarget(ctx, log.IDConversion)
		if err != nil {
			return fmt.Errorf("failed to fetch conversion target info: %w", err)
		}

		if err := u.feedsRepo.UpdateStock(ctx, targetFeedID, targetAmount, "tambah"); err != nil {
			return fmt.Errorf("failed to update feed stock: %w", err)
		}
	}

	return nil
}
