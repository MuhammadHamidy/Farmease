package domain

import (
	"context"
	"time"
)

type Task struct {
	IDTask      int       `json:"id_task" db:"id_task"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	TaskDate    time.Time `json:"task_date" db:"task_date"`
	Status      string    `json:"status" db:"status"` // pending/done
	IDAccount   int       `json:"id_account" db:"id_account"`
	Category    string    `json:"category" db:"category"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type TaskRepository interface {
	FindTasksByAccount(ctx context.Context, idAccount int, date *time.Time) ([]*Task, error)
	StoreTask(ctx context.Context, t *Task) error
	UpdateTaskStatus(ctx context.Context, id int, status string) error
}

type UseCase interface {
	GetMyTasks(ctx context.Context, idAccount int, date *time.Time) ([]*Task, error)
	CreateTask(ctx context.Context, t *Task) error
	CompleteTask(ctx context.Context, id int) error
}
