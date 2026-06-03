package domain

import (
	"context"
	"time"
)

type Weight struct {
	IDWeight     int       `json:"id_weight" db:"id_weight"`
	IDSheep      int       `json:"id_sheep" db:"id_sheep"`
	WeighingDate time.Time `json:"weighing_date" db:"weighing_date"`
	WeightKg     float64   `json:"weight_kg" db:"weight_kg"`
	Notes        string    `json:"notes" db:"notes"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type WeightFilter struct {
	IDSheep int
	Page    int
	PerPage int
}

type WeightRepository interface {
	FindAll(ctx context.Context, filter WeightFilter) ([]*Weight, int, error)
	FindHistoryBySheep(ctx context.Context, idSheep int) ([]*Weight, error)
	Store(ctx context.Context, w *Weight) error
}

type UseCase interface {
	GetWeightList(ctx context.Context, filter WeightFilter) ([]*Weight, int, error)
	GetWeightHistory(ctx context.Context, idSheep int) ([]*Weight, error)
	RecordWeight(ctx context.Context, w *Weight) error
}
