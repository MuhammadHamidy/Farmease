package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) GetMasterFeedList(ctx context.Context) ([]*domain.Feed, error) {
	return u.repo.FindAllMaster(ctx)
}
