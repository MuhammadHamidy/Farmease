package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

func (u *useCase) UpdateTask(ctx context.Context, id string, t *domain.Task) error {
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
