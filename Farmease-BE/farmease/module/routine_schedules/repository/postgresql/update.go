package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (r *routineScheduleRepository) Update(ctx context.Context, rs *domain.RoutineSchedule) error {
	var st, et *string
	if rs.StartTime != "" {
		st = &rs.StartTime
	}
	if rs.EndTime != "" {
		et = &rs.EndTime
	}
	var idCage *string
	if rs.IDCage != nil && *rs.IDCage != "" {
		idCage = rs.IDCage
	}
	var idAccount *string
	if rs.IDAccount != nil && *rs.IDAccount != "" {
		idAccount = rs.IDAccount
	}
	var rincian *string
	if rs.Rincian != "" {
		rincian = &rs.Rincian
	}

	_, err := r.db.Exec(ctx, `
		UPDATE operations.routine_schedules 
		SET title = $1, description = $2, category = $3, frequency = $4, days_of_week = $5, day_of_month = $6, start_date = $7, end_date = $8, start_time = $9::TIME, end_time = $10::TIME, priority = $11, id_cage = $12, id_account = $13, rincian = $14, is_active = $15, updated_at = CURRENT_TIMESTAMP
		WHERE id = $16
	`,
		rs.Title, rs.Description, rs.Category, rs.Frequency, rs.DaysOfWeek, rs.DayOfMonth, rs.StartDate, rs.EndDate, st, et, rs.Priority, idCage, idAccount, rincian, rs.IsActive, rs.ID,
	)

	return err
}
