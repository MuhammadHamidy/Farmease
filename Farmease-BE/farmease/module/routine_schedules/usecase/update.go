package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (u *useCase) Update(ctx context.Context, rs *domain.RoutineSchedule) error {
	existing, err := u.repo.FindByID(ctx, rs.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return fmt.Errorf("routine schedule not found")
	}

	if rs.Title == "" { rs.Title = existing.Title }
	if rs.Description == "" { rs.Description = existing.Description }
	if rs.Category == "" { rs.Category = existing.Category }
	if rs.Frequency == "" { rs.Frequency = existing.Frequency }
	if len(rs.DaysOfWeek) == 0 { rs.DaysOfWeek = existing.DaysOfWeek }
	if rs.DayOfMonth == nil { rs.DayOfMonth = existing.DayOfMonth }
	if rs.StartDate.IsZero() { rs.StartDate = existing.StartDate }
	if rs.EndDate == nil { rs.EndDate = existing.EndDate }
	if rs.StartTime == "" { rs.StartTime = existing.StartTime }
	if rs.EndTime == "" { rs.EndTime = existing.EndTime }
	if rs.Priority == "" { rs.Priority = existing.Priority }
	if rs.IDCage == nil { rs.IDCage = existing.IDCage }
	if rs.IDAccount == nil { rs.IDAccount = existing.IDAccount }
	if rs.Rincian == "" { rs.Rincian = existing.Rincian }

	return u.repo.Update(ctx, rs)
}
