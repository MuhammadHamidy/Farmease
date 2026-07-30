package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// FindDuplicate checks if another active schedule with the same title, category, cage, and operator already exists.
func (r *routineScheduleRepository) FindDuplicate(ctx context.Context, routineSchedule *domain.RoutineSchedule) (*domain.RoutineSchedule, error) {
	var idCage, idAccount interface{}
	if routineSchedule.IDCage != nil && *routineSchedule.IDCage != "" {
		idCage = *routineSchedule.IDCage
	}
	if routineSchedule.IDAccount != nil && *routineSchedule.IDAccount != "" {
		idAccount = *routineSchedule.IDAccount
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
	`, routineSchedule.Title, routineSchedule.Category, idCage, idAccount)
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
