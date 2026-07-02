package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) RecordFeedingMixture(ctx context.Context, fm *domain.FeedingMixture) error {
	for _, d := range fm.Details {
		if _, err := u.UpdateFeedStock(ctx, d.IDFeed, d.Amount, "kurang"); err != nil {
			return fmt.Errorf("gagal memotong stok pakan %s: %w", d.IDFeed, err)
		}
	}
	return u.repo.StoreFeedingMixture(ctx, fm)
}
