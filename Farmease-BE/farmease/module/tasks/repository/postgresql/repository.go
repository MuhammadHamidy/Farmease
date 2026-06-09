package postgresql

import (
	"context"
	"time"

	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindTasksByAccount(ctx context.Context, idAccount int, date *time.Time) ([]*domain.Task, error) {
	query := `SELECT id_task, title, description, task_date, end_time, status, priority, id_account, category, created_at, updated_at FROM operations.tasks WHERE id_account = $1`
	args := []interface{}{idAccount}
	if date != nil {
		query += " AND DATE(task_date) = $2"
		args = append(args, date)
	}
	query += " ORDER BY CASE WHEN priority = 'tinggi' THEN 1 WHEN priority = 'sedang' THEN 2 WHEN priority = 'rendah' THEN 3 ELSE 4 END ASC, task_date ASC"

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
		var idAcc *int
		err := rows.Scan(&t.IDTask, &t.Title, &desc, &taskDate, &end, &status, &priority, &idAcc, &cat, &created, &updated)
		if err != nil {
			return nil, err
		}
		if desc != nil { t.Description = *desc }
		if end != nil { t.EndTime = *end }
		if cat != nil { t.Category = *cat }
		if taskDate != nil { t.TaskDate = *taskDate }
		if status != nil { t.Status = *status }
		if priority != nil { t.Priority = *priority } else { t.Priority = "sedang" }
		if idAcc != nil { t.IDAccount = *idAcc }
		if created != nil { t.CreatedAt = *created }
		if updated != nil { t.UpdatedAt = *updated }
		list = append(list, &t)
	}
	return list, nil
}

func (r *Repository) StoreTask(ctx context.Context, t *domain.Task) error {
	query := `INSERT INTO operations.tasks (title, description, task_date, end_time, status, priority, id_account, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_task`
	return r.db.QueryRow(ctx, query, t.Title, t.Description, t.TaskDate, t.EndTime, t.Status, t.Priority, t.IDAccount, t.Category).Scan(&t.IDTask)
}

func (r *Repository) FindByID(ctx context.Context, id int) (*domain.Task, error) {
	query := `SELECT id_task, title, description, task_date, end_time, status, priority, id_account, category, created_at, updated_at FROM operations.tasks WHERE id_task = $1`
	var t domain.Task
	var desc, end, cat, status, priority *string
	var taskDate, created, updated *time.Time
	var idAcc *int
	err := r.db.QueryRow(ctx, query, id).Scan(&t.IDTask, &t.Title, &desc, &taskDate, &end, &status, &priority, &idAcc, &cat, &created, &updated)
	if err != nil {
		return nil, err
	}
	if desc != nil { t.Description = *desc }
	if end != nil { t.EndTime = *end }
	if cat != nil { t.Category = *cat }
	if taskDate != nil { t.TaskDate = *taskDate }
	if status != nil { t.Status = *status }
	if priority != nil { t.Priority = *priority } else { t.Priority = "sedang" }
	if idAcc != nil { t.IDAccount = *idAcc }
	if created != nil { t.CreatedAt = *created }
	if updated != nil { t.UpdatedAt = *updated }
	return &t, nil
}

func (r *Repository) UpdateTask(ctx context.Context, t *domain.Task) error {
	query := `UPDATE operations.tasks SET title = $1, description = $2, task_date = $3, end_time = $4, status = $5, priority = $6, id_account = $7, category = $8, updated_at = CURRENT_TIMESTAMP WHERE id_task = $9`
	_, err := r.db.Exec(ctx, query, t.Title, t.Description, t.TaskDate, t.EndTime, t.Status, t.Priority, t.IDAccount, t.Category, t.IDTask)
	return err
}

func (r *Repository) UpdateTaskStatus(ctx context.Context, id int, status string) error {
	query := `UPDATE operations.tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_task = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) DeleteTask(ctx context.Context, id int) error {
	query := `DELETE FROM operations.tasks WHERE id_task = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
