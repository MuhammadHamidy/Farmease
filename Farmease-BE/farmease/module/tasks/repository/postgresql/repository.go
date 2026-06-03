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
	query := `SELECT id_task, title, description, task_date, status, id_account, category, created_at, updated_at FROM operations.tasks WHERE id_account = $1`
	args := []interface{}{idAccount}
	if date != nil {
		query += " AND DATE(task_date) = $2"
		args = append(args, date)
	}
	query += " ORDER BY task_date ASC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Task
	for rows.Next() {
		var t domain.Task
		err := rows.Scan(&t.IDTask, &t.Title, &t.Description, &t.TaskDate, &t.Status, &t.IDAccount, &t.Category, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &t)
	}
	return list, nil
}

func (r *Repository) StoreTask(ctx context.Context, t *domain.Task) error {
	query := `INSERT INTO operations.tasks (title, description, task_date, status, id_account, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_task`
	return r.db.QueryRow(ctx, query, t.Title, t.Description, t.TaskDate, t.Status, t.IDAccount, t.Category).Scan(&t.IDTask)
}

func (r *Repository) UpdateTaskStatus(ctx context.Context, id int, status string) error {
	query := `UPDATE operations.tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_task = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}
