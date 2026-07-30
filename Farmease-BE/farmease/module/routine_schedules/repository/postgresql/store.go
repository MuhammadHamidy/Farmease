package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// Store creates a new routine schedule entry in the database.
func (r *routineScheduleRepository) Store(ctx context.Context, routineSchedule *domain.RoutineSchedule) error {
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

	err := r.db.QueryRow(ctx, `
		INSERT INTO operations.routine_schedules 
		(title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time, end_time, priority, id_cage, id_account, rincian, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::TIME, $10::TIME, $11, $12, $13, $14, $15)
		RETURNING id, created_at, updated_at
	`,
		routineSchedule.Title, routineSchedule.Description, routineSchedule.Category, routineSchedule.Frequency, routineSchedule.DaysOfWeek, routineSchedule.DayOfMonth, routineSchedule.StartDate, routineSchedule.EndDate, startTime, endTime, routineSchedule.Priority, idCage, idAccount, rincian, routineSchedule.IsActive,
	).Scan(&routineSchedule.ID, &routineSchedule.CreatedAt, &routineSchedule.UpdatedAt)

	return err
}
