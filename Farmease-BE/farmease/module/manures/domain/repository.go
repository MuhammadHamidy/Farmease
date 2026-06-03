package domain

import (
	"context"
	"time"
)

type Manure struct {
	IDManure              int       `json:"id_manure" db:"id_manure"`
	IDSheep               int       `json:"id_sheep" db:"id_sheep"`
	ActivityType          string    `json:"activity_type" db:"activity_type"` // e.g., collection/fermentation
	Amount                float64   `json:"amount" db:"amount"`
	Unit                  string    `json:"unit" db:"unit"`
	ExternalDestinationID *string   `json:"external_destination_id,omitempty" db:"external_destination_id"`
	DestinationType       string    `json:"destination_type" db:"destination_type"`
	Notes                 string    `json:"notes" db:"notes"`
	CreatedAt             time.Time `json:"created_at" db:"created_at"`
}

type ManureFilter struct {
	IDSheep int
	Page    int
	PerPage int
}

type ManureRepository interface {
	FindAll(ctx context.Context, filter ManureFilter) ([]*Manure, int, error)
	FindHistoryBySheep(ctx context.Context, idSheep int) ([]*Manure, error)
	Store(ctx context.Context, m *Manure) error
}

type UseCase interface {
	GetManureList(ctx context.Context, filter ManureFilter) ([]*Manure, int, error)
	GetManureHistory(ctx context.Context, idSheep int) ([]*Manure, error)
	RecordManure(ctx context.Context, m *Manure) error
}
