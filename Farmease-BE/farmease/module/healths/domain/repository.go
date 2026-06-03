package domain

import (
	"context"
	"time"
)

type Health struct {
	IDHealth      int       `json:"id_health" db:"id_health"`
	IDSheep       int       `json:"id_sheep" db:"id_sheep"`
	CheckupDate   time.Time `json:"checkup_date" db:"checkup_date"`
	Diagnosis     string    `json:"diagnosis" db:"diagnosis"`
	Action        string    `json:"action" db:"action"`
	MedicineGiven string    `json:"medicine_given" db:"medicine_given"`
	InspectorName string    `json:"inspector_name" db:"inspector_name"`
	Notes         string    `json:"notes" db:"notes"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

type HealthFilter struct {
	IDSheep int
	Page    int
	PerPage int
}

type HealthRepository interface {
	FindAll(ctx context.Context, filter HealthFilter) ([]*Health, int, error)
	FindHistoryBySheep(ctx context.Context, idSheep int) ([]*Health, error)
	Store(ctx context.Context, k *Health) error
	Update(ctx context.Context, k *Health) error
}

type UseCase interface {
	GetHealthList(ctx context.Context, filter HealthFilter) ([]*Health, int, error)
	GetHealthHistory(ctx context.Context, idSheep int) ([]*Health, error)
	RecordHealth(ctx context.Context, k *Health) error
	UpdateHealth(ctx context.Context, id int, k *Health) error
}
