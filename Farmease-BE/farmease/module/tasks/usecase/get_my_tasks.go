package usecase

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// GetMyTasks lists all tasks assigned to the current active operator or admin account on a specific date.
func (u *useCase) GetMyTasks(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*domain.Task, error) {
	return u.repo.FindTasksByAccount(ctx, idAccount, roleName, date)
}
