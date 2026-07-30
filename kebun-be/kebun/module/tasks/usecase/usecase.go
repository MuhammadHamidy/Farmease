package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/kebun-be/kebun/module/tasks/domain"
)

type useCase struct {
	repo domain.TaskRepository
}

func NewUseCase(repo domain.TaskRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) GetMyTasks(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*domain.Task, error) {
	return u.repo.FindTasksByAccount(ctx, idAccount, roleName, date)
}

func (u *useCase) CreateTask(ctx context.Context, t *domain.Task) error {
	if t.Status == "" {
		t.Status = "pending"
	}
	return u.repo.StoreTask(ctx, t)
}

func (u *useCase) UpdateTask(ctx context.Context, id string, t *domain.Task) error {
	existing, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("task not found")
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
	if t.EndTime == "" {
		t.EndTime = existing.EndTime
	}
	if t.Priority == "" {
		t.Priority = existing.Priority
	}
	if t.Status == "" {
		t.Status = existing.Status
	}
	if t.IDAccount == "" {
		t.IDAccount = existing.IDAccount
	}
	if t.Category == "" {
		t.Category = existing.Category
	}
	if t.ScheduleID == nil {
		t.ScheduleID = existing.ScheduleID
	}
	if t.IDCage == nil {
		t.IDCage = existing.IDCage
	}
	if t.StartTime == "" {
		t.StartTime = existing.StartTime
	}
	if t.Rincian == "" {
		t.Rincian = existing.Rincian
	}
	return u.repo.UpdateTask(ctx, t)
}

func (u *useCase) CompleteTask(ctx context.Context, id string) error {
	return u.repo.UpdateTaskStatus(ctx, id, "done")
}

func (u *useCase) DeleteTask(ctx context.Context, id string) error {
	return u.repo.DeleteTask(ctx, id)
}

