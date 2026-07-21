package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (r *routineScheduleRepository) Store(ctx context.Context, rs *domain.RoutineSchedule) error {
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

	err := r.db.QueryRow(ctx, `
		INSERT INTO operations.routine_schedules 
		(title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time, end_time, priority, id_cage, id_account, rincian, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::TIME, $10::TIME, $11, $12, $13, $14, $15)
		RETURNING id, created_at, updated_at
	`,
		rs.Title, rs.Description, rs.Category, rs.Frequency, rs.DaysOfWeek, rs.DayOfMonth, rs.StartDate, rs.EndDate, st, et, rs.Priority, idCage, idAccount, rincian, rs.IsActive,
	).Scan(&rs.ID, &rs.CreatedAt, &rs.UpdatedAt)

	return err
}
