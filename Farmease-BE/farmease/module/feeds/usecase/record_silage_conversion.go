package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) RecordSilageConversion(ctx context.Context, sc *domain.SilageConversion) error {
	for _, d := range sc.Details {
		if _, err := u.UpdateFeedStock(ctx, d.IDFeed, d.Amount, "kurang"); err != nil {
			return fmt.Errorf("gagal memotong stok bahan baku %s: %w", d.IDFeed, err)
		}
	}

	return u.repo.StoreSilageConversion(ctx, sc)
}
