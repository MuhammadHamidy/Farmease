package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// Update patches values of an existing routine schedule registry.
func (u *useCase) Update(ctx context.Context, routineSchedule *domain.RoutineSchedule) error {
	existing, err := u.repo.FindByID(ctx, routineSchedule.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return fmt.Errorf("routine schedule not found")
	}

	if routineSchedule.Title == "" { routineSchedule.Title = existing.Title }
	if routineSchedule.Description == "" { routineSchedule.Description = existing.Description }
	if routineSchedule.Category == "" { routineSchedule.Category = existing.Category }
	if routineSchedule.Frequency == "" { routineSchedule.Frequency = existing.Frequency }
	if len(routineSchedule.DaysOfWeek) == 0 { routineSchedule.DaysOfWeek = existing.DaysOfWeek }
	if routineSchedule.DayOfMonth == nil { routineSchedule.DayOfMonth = existing.DayOfMonth }
	if routineSchedule.StartDate.IsZero() { routineSchedule.StartDate = existing.StartDate }
	if routineSchedule.EndDate == nil { routineSchedule.EndDate = existing.EndDate }
	if routineSchedule.StartTime == "" { routineSchedule.StartTime = existing.StartTime }
	if routineSchedule.EndTime == "" { routineSchedule.EndTime = existing.EndTime }
	if routineSchedule.Priority == "" { routineSchedule.Priority = existing.Priority }
	if routineSchedule.IDCage == nil { routineSchedule.IDCage = existing.IDCage }
	if routineSchedule.IDAccount == nil { routineSchedule.IDAccount = existing.IDAccount }
	if routineSchedule.Rincian == "" { routineSchedule.Rincian = existing.Rincian }

	return u.repo.Update(ctx, routineSchedule)
}
