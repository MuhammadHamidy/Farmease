package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) RecordFeeding(ctx context.Context, f *domain.Feeding) error {
	// 1. Check stock
	_, err := u.UpdateFeedStock(ctx, f.IDFeed, f.Amount, "kurang")
	if err != nil {
		return err
	}
	// 2. Store record
	return u.repo.StoreFeeding(ctx, f)
}
