package domain

import (
	"context"
	"time"
)

type Cage struct {
	IDCage     int       `json:"id_cage" db:"id_cage"`
	FarmID     *string   `json:"farm_id,omitempty" db:"farm_id"`
	CageCode   string    `json:"cage_code" db:"cage_code"`
	Capacity   int       `json:"capacity" db:"capacity"`
	CageType   string    `json:"cage_type" db:"cage_type"`
	Occupancy  int       `json:"occupancy" db:"occupancy"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

type CageFilter struct {
	CageType string
	Page     int
	PerPage  int
}

type CageStats struct {
	TotalAnimals    int `json:"total_animals"`
	Healthy         int `json:"healthy"`
	AttentionNeeded int `json:"attention_needed"`
}

type MonthlyWeight struct {
	Month  string  `json:"month"`
	Weight float64 `json:"weight"`
}

type CageWeightStats struct {
	CurrentAverage   float64         `json:"current_average"`
	GrowthKg         float64         `json:"growth_kg"`
	GrowthPercentage float64         `json:"growth_percentage"`
	MonthlyTrend     []MonthlyWeight `json:"monthly_trend"`
}

type CageRepository interface {
	FindAll(ctx context.Context, filter CageFilter) ([]*Cage, int, error)
	FindByID(ctx context.Context, id int) (*Cage, error)
	FindByCode(ctx context.Context, code string) (*Cage, error)
	Store(ctx context.Context, cage *Cage) error
	Update(ctx context.Context, cage *Cage) error
	Delete(ctx context.Context, id int) error
	GetOccupancy(ctx context.Context, id int) (int, error)
	GetCageStats(ctx context.Context, id int) (*CageStats, error)
	GetCageWeightStats(ctx context.Context, id int) (*CageWeightStats, error)
}

type UseCase interface {
	GetCageList(ctx context.Context, filter CageFilter) ([]*Cage, int, error)
	CreateCage(ctx context.Context, cage *Cage) error
	GetCageDetail(ctx context.Context, id int) (*Cage, error)
	UpdateCage(ctx context.Context, id int, cage *Cage) error
	DeleteCage(ctx context.Context, id int) error
	VerifyCage(ctx context.Context, code string) (*Cage, error)
	GetCageStats(ctx context.Context, id int) (*CageStats, error)
	GetCageWeightStats(ctx context.Context, id int) (*CageWeightStats, error)
}
