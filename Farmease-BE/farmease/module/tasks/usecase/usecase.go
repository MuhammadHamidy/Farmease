package usecase

import (
	"context"
	"time"

	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type useCase struct {
	repo domain.TaskRepository
}

func NewUseCase(repo domain.TaskRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetMyTasks(ctx context.Context, idAccount int, date *time.Time) ([]*domain.Task, error) {
	return u.repo.FindTasksByAccount(ctx, idAccount, date)
}

func (u *useCase) CreateTask(ctx context.Context, t *domain.Task) error {
	if t.Status == "" {
		t.Status = "pending"
	}
	return u.repo.StoreTask(ctx, t)
}

func (u *useCase) UpdateTask(ctx context.Context, id int, t *domain.Task) error {
	existing, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	t.IDTask = id
	if t.Title == "" {
		t.Title = existing.Title
	}
	if t.Description == "" {
		t.Description = existing.Description
	}
	if t.TaskDate.IsZero() {
		t.TaskDate = existing.TaskDate
	}
	if t.Status == "" {
		t.Status = existing.Status
	}
	if t.IDAccount == 0 {
		t.IDAccount = existing.IDAccount
	}
	if t.Category == "" {
		t.Category = existing.Category
	}
	return u.repo.UpdateTask(ctx, t)
}

func (u *useCase) CompleteTask(ctx context.Context, id int) error {
	return u.repo.UpdateTaskStatus(ctx, id, "done")
}

func (u *useCase) DeleteTask(ctx context.Context, id int) error {
	return u.repo.DeleteTask(ctx, id)
}
