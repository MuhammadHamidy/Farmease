package domain

import (
	"context"
	"time"
)

type RoutineSchedule struct {
	ID          string     `json:"id" db:"id"`
	Title       string     `json:"title" db:"title"`
	Description string     `json:"description" db:"description"`
	Category    string     `json:"category" db:"category"`
	Frequency   string     `json:"frequency" db:"frequency"`       // sekali | harian | mingguan | bulanan
	DaysOfWeek  []int32    `json:"days_of_week" db:"days_of_week"` // [0,1,...,6] (0=Minggu, 1=Senin, etc.)
	DayOfMonth  *int32     `json:"day_of_month" db:"day_of_month"` // 1-31
	StartDate   time.Time  `json:"start_date" db:"start_date"`
	EndDate     *time.Time `json:"end_date" db:"end_date"`
	StartTime   string     `json:"start_time" db:"start_time"` // "HH:MM:SS" or "HH:MM"
	EndTime     string     `json:"end_time" db:"end_time"`     // "HH:MM:SS" or "HH:MM"
	Priority    string     `json:"priority" db:"priority"`     // rendah | sedang | tinggi
	IDCage      *string    `json:"id_cage,omitempty" db:"id_cage"` // serves as id_lahan / land ID
	IDAccount   *string    `json:"id_account,omitempty" db:"id_account"`
	Rincian     string     `json:"rincian" db:"rincian"`
	IsActive    bool       `json:"is_active" db:"is_active"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

type RoutineScheduleRepository interface {
	FindAll(ctx context.Context) ([]*RoutineSchedule, error)
	FindByID(ctx context.Context, id string) (*RoutineSchedule, error)
	FindDuplicate(ctx context.Context, rs *RoutineSchedule) (*RoutineSchedule, error)
	Store(ctx context.Context, rs *RoutineSchedule) error
	Update(ctx context.Context, rs *RoutineSchedule) error
	Delete(ctx context.Context, id string) error
	FindActiveSchedules(ctx context.Context) ([]*RoutineSchedule, error)
}

type RoutineScheduleUsecase interface {
	FindAll(ctx context.Context) ([]*RoutineSchedule, error)
	FindByID(ctx context.Context, id string) (*RoutineSchedule, error)
	Create(ctx context.Context, rs *RoutineSchedule) error
	Update(ctx context.Context, rs *RoutineSchedule) error
	Delete(ctx context.Context, id string) error
	GenerateTasks(ctx context.Context, windowDays int) error
	GenerateTasksForSchedule(ctx context.Context, scheduleID string, windowDays int) error
}
