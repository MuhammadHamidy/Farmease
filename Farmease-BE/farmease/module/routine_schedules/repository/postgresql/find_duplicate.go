package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (r *routineScheduleRepository) FindDuplicate(ctx context.Context, rs *domain.RoutineSchedule) (*domain.RoutineSchedule, error) {
	var idCage, idAccount interface{}
	if rs.IDCage != nil && *rs.IDCage != "" {
		idCage = *rs.IDCage
	}
	if rs.IDAccount != nil && *rs.IDAccount != "" {
		idAccount = *rs.IDAccount
	}

	rows, err := r.db.Query(ctx, `
		SELECT id, title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time::TEXT, end_time::TEXT, priority, id_cage, id_account, rincian, is_active, created_at, updated_at 
		FROM operations.routine_schedules 
		WHERE title = $1
		  AND category = $2
		  AND COALESCE(id_cage::TEXT, '') = COALESCE($3::TEXT, '')
		  AND COALESCE(id_account::TEXT, '') = COALESCE($4::TEXT, '')
		  AND is_active = TRUE
		LIMIT 1
	`, rs.Title, rs.Category, idCage, idAccount)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil
	}

	found := &domain.RoutineSchedule{}
	if err := scanRoutineSchedule(found, rows); err != nil {
		return nil, err
	}
	return found, nil
}
