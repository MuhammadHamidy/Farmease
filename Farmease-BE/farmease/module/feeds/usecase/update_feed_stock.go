package usecase

import (
	"context"
	"errors"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (u *useCase) UpdateFeedStock(ctx context.Context, id string, amount float64, actionType string) (*domain.Feed, error) {
	master, err := u.repo.FindMasterByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if actionType == "kurang" && master.AvailableStock < amount {
		return nil, errors.New("insufficient stock")
	}
	err = u.repo.UpdateStock(ctx, id, amount, actionType)
	if err != nil {
		return nil, err
	}
	updated, err := u.repo.FindMasterByID(ctx, id)
	return updated, err
}
