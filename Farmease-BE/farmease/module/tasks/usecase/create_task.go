package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// CreateTask registers a new routine or ad-hoc task.
func (u *useCase) CreateTask(ctx context.Context, task *domain.Task) error {
	if task.Status == "" {
		task.Status = "pending"
	}
	return u.repo.StoreTask(ctx, task)
}
