package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (r *routineScheduleRepository) FindByID(ctx context.Context, id string) (*domain.RoutineSchedule, error) {
	rows, err := r.db.Query(ctx, `SELECT id, title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time::TEXT, end_time::TEXT, priority, id_cage, id_account, rincian, is_active, created_at, updated_at FROM operations.routine_schedules WHERE id = $1`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		if err := rows.Err(); err != nil {
			return nil, err
		}
		return nil, nil
	}

	rs := &domain.RoutineSchedule{}
	if err := scanRoutineSchedule(rs, rows); err != nil {
		return nil, err
	}
	return rs, nil
}
