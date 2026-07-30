package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// UpdateTask modifies existing task fields, falling back to original values if parameters are blank.
func (u *useCase) UpdateTask(ctx context.Context, id string, task *domain.Task) error {
	existing, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	task.IDTask = id
	if task.Title == "" {
		task.Title = existing.Title
	}
	if task.Description == "" {
		task.Description = existing.Description
	}
	if task.TaskDate.IsZero() {
		task.TaskDate = existing.TaskDate
	}
	if task.EndTime == "" {
		task.EndTime = existing.EndTime
	}
	if task.Priority == "" {
		task.Priority = existing.Priority
	}
	if task.Status == "" {
		task.Status = existing.Status
	}
	if task.IDAccount == "" {
		task.IDAccount = existing.IDAccount
	}
	if task.Category == "" {
		task.Category = existing.Category
	}
	if task.ScheduleID == nil {
		task.ScheduleID = existing.ScheduleID
	}
	if task.IDCage == nil {
		task.IDCage = existing.IDCage
	}
	if task.StartTime == "" {
		task.StartTime = existing.StartTime
	}
	if task.Rincian == "" {
		task.Rincian = existing.Rincian
	}
	return u.repo.UpdateTask(ctx, task)
}
