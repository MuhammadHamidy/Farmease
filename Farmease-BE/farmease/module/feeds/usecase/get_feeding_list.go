package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) GetFeedingList(ctx context.Context, filter domain.FeedingFilter) ([]*domain.Feeding, int, error) {
	return u.repo.FindAllFeedings(ctx, filter)
}
