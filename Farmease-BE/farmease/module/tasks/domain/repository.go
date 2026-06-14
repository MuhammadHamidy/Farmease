package domain

import (
	"context"
	"time"
)

type Task struct {
	IDTask      string    `json:"id_task" db:"id_task"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	TaskDate    time.Time `json:"task_date" db:"task_date"`
	EndTime     string    `json:"end_time" db:"end_time"`
	Status      string    `json:"status" db:"status"` // pending/done
	Priority    string    `json:"priority" db:"priority"`
	IDAccount   string    `json:"id_account" db:"id_account"`
	Category    string    `json:"category" db:"category"`
	ScheduleID  *string   `json:"schedule_id,omitempty" db:"schedule_id"`
	IDCage      *string   `json:"id_cage,omitempty" db:"id_cage"`
	StartTime   string    `json:"start_time" db:"start_time"`
	Rincian     string    `json:"rincian" db:"rincian"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type TaskRepository interface {
	FindTasksByAccount(ctx context.Context, idAccount string, date *time.Time) ([]*Task, error)
	FindByID(ctx context.Context, id string) (*Task, error)
	StoreTask(ctx context.Context, t *Task) error
	UpdateTask(ctx context.Context, t *Task) error
	UpdateTaskStatus(ctx context.Context, id string, status string) error
	DeleteTask(ctx context.Context, id string) error
	FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*Task, error)
}

type UseCase interface {
	GetMyTasks(ctx context.Context, idAccount string, date *time.Time) ([]*Task, error)
	CreateTask(ctx context.Context, t *Task) error
	UpdateTask(ctx context.Context, id string, t *Task) error
	CompleteTask(ctx context.Context, id string) error
	DeleteTask(ctx context.Context, id string) error
}
