package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

func (u *useCase) CreateTask(ctx context.Context, t *domain.Task) error {
	if t.Status == "" {
		t.Status = "pending"
	}
	return u.repo.StoreTask(ctx, t)
}
