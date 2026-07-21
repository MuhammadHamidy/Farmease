package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// Update modifies properties of an existing routine schedule in the database.
func (r *routineScheduleRepository) Update(ctx context.Context, routineSchedule *domain.RoutineSchedule) error {
	var startTime, endTime *string
	if routineSchedule.StartTime != "" {
		startTime = &routineSchedule.StartTime
	}
	if routineSchedule.EndTime != "" {
		endTime = &routineSchedule.EndTime
	}
	var idCage *string
	if routineSchedule.IDCage != nil && *routineSchedule.IDCage != "" {
		idCage = routineSchedule.IDCage
	}
	var idAccount *string
	if routineSchedule.IDAccount != nil && *routineSchedule.IDAccount != "" {
		idAccount = routineSchedule.IDAccount
	}
	var rincian *string
	if routineSchedule.Rincian != "" {
		rincian = &routineSchedule.Rincian
	}

	_, err := r.db.Exec(ctx, `
		UPDATE operations.routine_schedules 
		SET title = $1, description = $2, category = $3, frequency = $4, days_of_week = $5, day_of_month = $6, start_date = $7, end_date = $8, start_time = $9::TIME, end_time = $10::TIME, priority = $11, id_cage = $12, id_account = $13, rincian = $14, is_active = $15, updated_at = CURRENT_TIMESTAMP
		WHERE id = $16
	`,
		routineSchedule.Title, routineSchedule.Description, routineSchedule.Category, routineSchedule.Frequency, routineSchedule.DaysOfWeek, routineSchedule.DayOfMonth, routineSchedule.StartDate, routineSchedule.EndDate, startTime, endTime, routineSchedule.Priority, idCage, idAccount, rincian, routineSchedule.IsActive, routineSchedule.ID,
	)

	return err
}
