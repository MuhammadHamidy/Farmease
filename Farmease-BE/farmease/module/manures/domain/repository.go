package domain

import (
	"context"
	"time"
)

type Manure struct {
	IDManure              string    `json:"id_manure" db:"id_manure"`
	IDSheep               string    `json:"id_sheep" db:"id_sheep"`
	IDCage                string    `json:"id_cage,omitempty" db:"id_cage"`
	ActivityType          string    `json:"activity_type" db:"activity_type" validate:"required,oneof=collection fermentation distribution"`
	Amount                float64   `json:"amount" db:"amount" validate:"required,gt=0"`
	Unit                  string    `json:"unit" db:"unit" validate:"required"`
	ExternalDestinationID *string   `json:"external_destination_id,omitempty" db:"external_destination_id"`
	DestinationType       string    `json:"destination_type" db:"destination_type" validate:"required"`
	Notes                 string    `json:"notes" db:"notes"`
	CreatedAt             time.Time `json:"created_at" db:"created_at"`
}

type ManureFilter struct {
	IDSheep string
	Page    int
	PerPage int
}

type ManureRepository interface {
	FindAll(ctx context.Context, filter ManureFilter) ([]*Manure, int, error)
	FindHistoryBySheep(ctx context.Context, idSheep string) ([]*Manure, error)
	FindHistoryByCage(ctx context.Context, idCage string) ([]*Manure, error)
	Store(ctx context.Context, m *Manure) error
}

type UseCase interface {
	GetManureList(ctx context.Context, filter ManureFilter) ([]*Manure, int, error)
	GetManureHistory(ctx context.Context, idSheep string) ([]*Manure, error)
	GetManureHistoryByCage(ctx context.Context, idCage string) ([]*Manure, error)
	RecordManure(ctx context.Context, m *Manure) error
}
