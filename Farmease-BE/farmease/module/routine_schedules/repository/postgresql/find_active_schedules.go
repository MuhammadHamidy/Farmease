package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// FindActiveSchedules queries all active routine schedules.
func (r *routineScheduleRepository) FindActiveSchedules(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time::TEXT, end_time::TEXT, priority, id_cage, id_account, rincian, is_active, created_at, updated_at 
		FROM operations.routine_schedules 
		WHERE is_active = TRUE
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scheduleList []*domain.RoutineSchedule
	for rows.Next() {
		routineSchedule := &domain.RoutineSchedule{}
		if err := scanRoutineSchedule(routineSchedule, rows); err != nil {
			return nil, err
		}
		scheduleList = append(scheduleList, routineSchedule)
	}
	return scheduleList, nil
}
