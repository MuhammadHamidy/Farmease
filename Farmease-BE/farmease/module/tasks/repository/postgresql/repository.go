package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*domain.Task, error) {
	// If Admin, they can see all tasks.
	// If Operator (e.g. Operator Kandang), they can only see their own tasks.
	query := `SELECT t.id_task, t.title, t.description, t.task_date, t.end_time, t.status, t.priority, t.id_account, t.category, t.schedule_id, t.id_cage, t.start_time::TEXT, t.rincian, t.id_mating, t.created_at, t.updated_at 
FROM operations.tasks t 
WHERE ($1 = 'Admin' OR t.id_account = $2)`
	args := []interface{}{roleName, idAccount}
	if date != nil {
		query += " AND (t.task_date AT TIME ZONE 'Asia/Jakarta')::DATE = $3::DATE"
		args = append(args, date.Format("2006-01-02"))
	}
	query += " ORDER BY CASE WHEN t.priority = 'tinggi' THEN 1 WHEN t.priority = 'sedang' THEN 2 WHEN t.priority = 'rendah' THEN 3 ELSE 4 END ASC, t.task_date ASC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Task
	for rows.Next() {
		var t domain.Task
		var desc, end, cat, status, priority *string
		var taskDate, created, updated *time.Time
		var idAcc, scheduleId, idCage, startTime, rincian, idMating *string
		err := rows.Scan(&t.IDTask, &t.Title, &desc, &taskDate, &end, &status, &priority, &idAcc, &cat, &scheduleId, &idCage, &startTime, &rincian, &idMating, &created, &updated)
		if err != nil {
			return nil, err
		}
		if desc != nil {
			t.Description = *desc
		}
		if end != nil {
			t.EndTime = *end
		}
		if cat != nil {
			t.Category = *cat
		}
		if taskDate != nil {
			t.TaskDate = *taskDate
		}
		if status != nil {
			t.Status = *status
		}
		if priority != nil {
			t.Priority = *priority
		} else {
			t.Priority = "sedang"
		}
		if idAcc != nil {
			t.IDAccount = *idAcc
		}
		t.ScheduleID = scheduleId
		t.IDCage = idCage
		if startTime != nil && len(*startTime) >= 5 {
			t.StartTime = (*startTime)[:5]
		}
		if rincian != nil {
			t.Rincian = *rincian
		}
		t.IDMating = idMating
		if created != nil {
			t.CreatedAt = *created
		}
		if updated != nil {
			t.UpdatedAt = *updated
		}
		list = append(list, &t)
	}
	return list, nil
}

func (r *Repository) StoreTask(ctx context.Context, t *domain.Task) error {
	var st *string
	if t.StartTime != "" {
		st = &t.StartTime
	}
	var idAccount *string
	if t.IDAccount != "" {
		idAccount = &t.IDAccount
	}
	var scheduleID *string
	if t.ScheduleID != nil && *t.ScheduleID != "" {
		scheduleID = t.ScheduleID
	}
	var idCage *string
	if t.IDCage != nil && *t.IDCage != "" {
		idCage = t.IDCage
	}
	var idMating *string
	if t.IDMating != nil && *t.IDMating != "" {
		idMating = t.IDMating
	}
	query := `INSERT INTO operations.tasks (title, description, task_date, end_time, status, priority, id_account, category, schedule_id, id_cage, start_time, rincian, id_mating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::TIME, $12, $13) RETURNING id_task`
	return r.db.QueryRow(ctx, query, t.Title, t.Description, t.TaskDate, t.EndTime, t.Status, t.Priority, idAccount, t.Category, scheduleID, idCage, st, t.Rincian, idMating).Scan(&t.IDTask)
}

func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Task, error) {
	query := `SELECT id_task, title, description, task_date, end_time, status, priority, id_account, category, schedule_id, id_cage, start_time::TEXT, rincian, id_mating, created_at, updated_at FROM operations.tasks WHERE id_task = $1`
	var t domain.Task
	var desc, end, cat, status, priority *string
	var taskDate, created, updated *time.Time
	var idAcc, scheduleId, idCage, startTime, rincian, idMating *string
	err := r.db.QueryRow(ctx, query, id).Scan(&t.IDTask, &t.Title, &desc, &taskDate, &end, &status, &priority, &idAcc, &cat, &scheduleId, &idCage, &startTime, &rincian, &idMating, &created, &updated)
	if err != nil {
		return nil, err
	}
	if desc != nil {
		t.Description = *desc
	}
	if end != nil {
		t.EndTime = *end
	}
	if cat != nil {
		t.Category = *cat
	}
	if taskDate != nil {
		t.TaskDate = *taskDate
	}
	if status != nil {
		t.Status = *status
	}
	if priority != nil {
		t.Priority = *priority
	} else {
		t.Priority = "sedang"
	}
	if idAcc != nil {
		t.IDAccount = *idAcc
	}
	t.ScheduleID = scheduleId
	t.IDCage = idCage
	if startTime != nil && len(*startTime) >= 5 {
		t.StartTime = (*startTime)[:5]
	}
	if rincian != nil {
		t.Rincian = *rincian
	}
	t.IDMating = idMating
	if created != nil {
		t.CreatedAt = *created
	}
	if updated != nil {
		t.UpdatedAt = *updated
	}
	return &t, nil
}

func (r *Repository) UpdateTask(ctx context.Context, t *domain.Task) error {
	var st *string
	if t.StartTime != "" {
		st = &t.StartTime
	}
	var idAccount *string
	if t.IDAccount != "" {
		idAccount = &t.IDAccount
	}
	var scheduleID *string
	if t.ScheduleID != nil && *t.ScheduleID != "" {
		scheduleID = t.ScheduleID
	}
	var idCage *string
	if t.IDCage != nil && *t.IDCage != "" {
		idCage = t.IDCage
	}
	var idMating *string
	if t.IDMating != nil && *t.IDMating != "" {
		idMating = t.IDMating
	}
	query := `UPDATE operations.tasks SET title = $1, description = $2, task_date = $3, end_time = $4, status = $5, priority = $6, id_account = $7, category = $8, schedule_id = $9, id_cage = $10, start_time = $11::TIME, rincian = $12, id_mating = $13, updated_at = CURRENT_TIMESTAMP WHERE id_task = $14`
	_, err := r.db.Exec(ctx, query, t.Title, t.Description, t.TaskDate, t.EndTime, t.Status, t.Priority, idAccount, t.Category, scheduleID, idCage, st, t.Rincian, idMating, t.IDTask)
	return err
}

func (r *Repository) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE operations.tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_task = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) DeleteTask(ctx context.Context, id string) error {
	query := `DELETE FROM operations.tasks WHERE id_task = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *Repository) FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*domain.Task, error) {
	query := `SELECT id_task, title, description, task_date, end_time, status, priority, id_account, category, schedule_id, id_cage, start_time::TEXT, rincian, id_mating, created_at, updated_at FROM operations.tasks WHERE schedule_id = $1 AND (task_date AT TIME ZONE 'Asia/Jakarta')::DATE = $2::DATE LIMIT 1`
	var t domain.Task
	var desc, end, cat, status, priority *string
	var tDate, created, updated *time.Time
	var idAcc, scheduleId, idCage, startTime, rincian, idMating *string
	err := r.db.QueryRow(ctx, query, scheduleID, taskDate.Format("2006-01-02")).Scan(&t.IDTask, &t.Title, &desc, &tDate, &end, &status, &priority, &idAcc, &cat, &scheduleId, &idCage, &startTime, &rincian, &idMating, &created, &updated)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if desc != nil {
		t.Description = *desc
	}
	if end != nil {
		t.EndTime = *end
	}
	if cat != nil {
		t.Category = *cat
	}
	if tDate != nil {
		t.TaskDate = *tDate
	}
	if status != nil {
		t.Status = *status
	}
	if priority != nil {
		t.Priority = *priority
	} else {
		t.Priority = "sedang"
	}
	if idAcc != nil {
		t.IDAccount = *idAcc
	}
	t.ScheduleID = scheduleId
	t.IDCage = idCage
	if startTime != nil && len(*startTime) >= 5 {
		t.StartTime = (*startTime)[:5]
	}
	if rincian != nil {
		t.Rincian = *rincian
	}
	t.IDMating = idMating
	if created != nil {
		t.CreatedAt = *created
	}
	if updated != nil {
		t.UpdatedAt = *updated
	}
	return &t, nil
}
