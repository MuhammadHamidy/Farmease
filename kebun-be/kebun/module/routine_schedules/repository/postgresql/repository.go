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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, _ = db.Exec(ctx, `
		DELETE FROM gardening.tasks
		WHERE schedule_id IN (
			SELECT id FROM gardening.routine_schedules
			WHERE id NOT IN (
				SELECT DISTINCT ON (title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
					id
				FROM gardening.routine_schedules
				ORDER BY title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''), created_at ASC
			)
		);
	`)

	_, _ = db.Exec(ctx, `
		DELETE FROM gardening.routine_schedules
		WHERE id NOT IN (
			SELECT DISTINCT ON (title, category, frequency, COALESCE(start_time::TEXT, ''), COALESCE(id_cage::TEXT, ''), COALESCE(id_account::TEXT, ''))
				id
			FROM gardening.routine_schedules
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

func (r *routineScheduleRepository) FindAll(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	rows, err := r.db.Query(ctx, `SELECT id, title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time::TEXT, end_time::TEXT, priority, id_cage, id_account, rincian, is_active, created_at, updated_at FROM gardening.routine_schedules ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.RoutineSchedule
	for rows.Next() {
		rs := &domain.RoutineSchedule{}
		if err := scanRoutineSchedule(rs, rows); err != nil {
			return nil, err
		}
		list = append(list, rs)
	}
	return list, nil
}

func (r *routineScheduleRepository) FindByID(ctx context.Context, id string) (*domain.RoutineSchedule, error) {
	rows, err := r.db.Query(ctx, `SELECT id, title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time::TEXT, end_time::TEXT, priority, id_cage, id_account, rincian, is_active, created_at, updated_at FROM gardening.routine_schedules WHERE id = $1`, id)
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
		FROM gardening.routine_schedules 
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

	err := r.db.QueryRow(ctx, `
		INSERT INTO gardening.routine_schedules 
		(title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time, end_time, priority, id_cage, id_account, rincian, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::TIME, $10::TIME, $11, $12, $13, $14, $15)
		RETURNING id, created_at, updated_at
	`,
		rs.Title, rs.Description, rs.Category, rs.Frequency, rs.DaysOfWeek, rs.DayOfMonth, rs.StartDate, rs.EndDate, st, et, rs.Priority, idCage, idAccount, rs.Rincian, rs.IsActive,
	).Scan(&rs.ID, &rs.CreatedAt, &rs.UpdatedAt)

	return err
}

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

	_, err := r.db.Exec(ctx, `
		UPDATE gardening.routine_schedules 
		SET title = $1, description = $2, category = $3, frequency = $4, days_of_week = $5, day_of_month = $6, start_date = $7, end_date = $8, start_time = $9::TIME, end_time = $10::TIME, priority = $11, id_cage = $12, id_account = $13, rincian = $14, is_active = $15, updated_at = CURRENT_TIMESTAMP
		WHERE id = $16
	`,
		rs.Title, rs.Description, rs.Category, rs.Frequency, rs.DaysOfWeek, rs.DayOfMonth, rs.StartDate, rs.EndDate, st, et, rs.Priority, idCage, idAccount, rs.Rincian, rs.IsActive, rs.ID,
	)

	return err
}

func (r *routineScheduleRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.routine_schedules WHERE id = $1", id)
	return err
}

func (r *routineScheduleRepository) FindActiveSchedules(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, title, description, category, frequency, days_of_week, day_of_month, start_date, end_date, start_time::TEXT, end_time::TEXT, priority, id_cage, id_account, rincian, is_active, created_at, updated_at 
		FROM gardening.routine_schedules 
		WHERE is_active = TRUE
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.RoutineSchedule
	for rows.Next() {
		rs := &domain.RoutineSchedule{}
		if err := scanRoutineSchedule(rs, rows); err != nil {
			return nil, err
		}
		list = append(list, rs)
	}
	return list, nil
}
