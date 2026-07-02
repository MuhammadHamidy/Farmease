package postgresql

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)




type routineScheduleRepository struct {
	db *pgxpool.Pool
}

func NewRoutineScheduleRepository(db *pgxpool.Pool) domain.RoutineScheduleRepository {
	// Clean up duplicate schedules and tasks on startup
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, _ = db.Exec(ctx, `
		DELETE FROM operations.tasks
		WHERE schedule_id IN (
			SELECT id FROM operations.routine_schedules
			WHERE id NOT IN (
				SELECT DISTINCT ON (title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
					id
				FROM operations.routine_schedules
				ORDER BY title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''), created_at ASC
			)
		);
	`)

	_, _ = db.Exec(ctx, `
		DELETE FROM operations.routine_schedules
		WHERE id NOT IN (
			SELECT DISTINCT ON (title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
				id
			FROM operations.routine_schedules
			ORDER BY title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''), created_at ASC
		);
	`)

	return &routineScheduleRepository{db: db}
}

func scanRoutineSchedule(rs *domain.RoutineSchedule, rows pgx.Rows) error {
	var desc, cat, prio, idCage, idAccount, rincian *string
	var daysOfWeek []int32
	var dayOfMonth *int32
	var endDate *time.Time
	var startTimeStr, endTimeStr *string

	err := rows.Scan(
		&rs.ID, &rs.Title, &desc, &cat, &rs.Frequency, &daysOfWeek, &dayOfMonth,
		&rs.StartDate, &endDate, &startTimeStr, &endTimeStr, &prio, &idCage,
		&idAccount, &rincian, &rs.IsActive, &rs.CreatedAt, &rs.UpdatedAt,
	)
	if err != nil {
		return err
	}
	if desc != nil {
		rs.Description = *desc
	}
	if cat != nil {
		rs.Category = *cat
	}
	if prio != nil {
		rs.Priority = *prio
	}
	rs.IDCage = idCage
	rs.IDAccount = idAccount
	if rincian != nil {
		rs.Rincian = *rincian
	}
	rs.DaysOfWeek = daysOfWeek
	rs.DayOfMonth = dayOfMonth
	rs.EndDate = endDate
	if startTimeStr != nil && len(*startTimeStr) >= 5 {
		rs.StartTime = (*startTimeStr)[:5]
	}
	if endTimeStr != nil && len(*endTimeStr) >= 5 {
		rs.EndTime = (*endTimeStr)[:5]
	}
	return nil
}
