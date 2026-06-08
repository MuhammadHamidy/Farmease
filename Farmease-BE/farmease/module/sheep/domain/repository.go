package domain

import (
	"context"
	"time"
)

type Sheep struct {
	IDSheep      int        `json:"id_sheep" db:"id_sheep"`
	SheepCode    string     `json:"sheep_code" db:"sheep_code"`
	SheepName    string     `json:"sheep_name" db:"sheep_name"`
	Gender       string     `json:"gender" db:"gender"`
	DateOfBirth  *time.Time `json:"date_of_birth" db:"date_of_birth"`
	AgeDays      int        `json:"age_days,omitempty"`
	AgeMonths    float64    `json:"age_months,omitempty"`
	AgeString    string     `json:"age_string,omitempty"`
	Status       string     `json:"status" db:"status"`
	Origin       string     `json:"origin" db:"origin"`
	IDCage       int        `json:"id_cage" db:"id_cage"`
	IDType       int        `json:"id_type" db:"id_type"`
	IDSire       *int       `json:"id_sire" db:"id_sire"`
	IDDam        *int       `json:"id_dam" db:"id_dam"`
	FirstWeight  float64    `json:"-" db:"first_weight"`
	FirstWeightDate *time.Time `json:"-" db:"first_weight_date"`
	LastWeight   float64    `json:"last_weight" db:"last_weight"`
	LastWeightDate *time.Time `json:"-" db:"last_weight_date"`
	TypeName     string     `json:"type_name,omitempty" db:"type_name"`
	ADG          *int       `json:"adg,omitempty"`
	ADGLabel     string     `json:"adg_label,omitempty"`
	Sire         *Parent    `json:"sire,omitempty"`
	Dam          *Parent    `json:"dam,omitempty"`
	CreatedBy    *int       `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy    *int       `json:"updated_by,omitempty" db:"updated_by"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

type Parent struct {
	IDSheep   int    `json:"id_sheep"`
	SheepName string `json:"sheep_name"`
}

type SheepFilter struct {
	IDCage       int
	Gender       string
	Status       string
	Search       string
	Page         int
	PerPage      int
}

type Genealogy struct {
	IDSheep   int        `json:"id_sheep"`
	SheepName string     `json:"sheep_name"`
	Sire      *Genealogy `json:"sire,omitempty"`
	Dam       *Genealogy `json:"dam,omitempty"`
}

type SheepType struct {
	IDType          int       `json:"id_type" db:"id_type"`
	TypeName        string    `json:"type_name" db:"type_name"`
	TypeDescription string    `json:"type_description" db:"type_description"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type SheepRepository interface {
	FindAll(ctx context.Context, filter SheepFilter) ([]*Sheep, int, error)
	FindByID(ctx context.Context, id int) (*Sheep, error)
	FindByCode(ctx context.Context, code string) (*Sheep, error)
	Store(ctx context.Context, s *Sheep) error
	Update(ctx context.Context, s *Sheep) error
	UpdateStatus(ctx context.Context, id int, status string, notes string) error
	GetGenealogy(ctx context.Context, id int, maxGeneration int) (*Genealogy, error)
	FindAllTypes(ctx context.Context) ([]*SheepType, error)
	StoreType(ctx context.Context, t *SheepType) error
	UpdateType(ctx context.Context, id int, t *SheepType) error
}

type UseCase interface {
	GetSheepList(ctx context.Context, filter SheepFilter) ([]*Sheep, int, error)
	RegisterSheep(ctx context.Context, s *Sheep) error
	GetSheepDetail(ctx context.Context, id int) (*Sheep, error)
	UpdateSheep(ctx context.Context, id int, s *Sheep) error
	UpdateSheepStatus(ctx context.Context, id int, status string, notes string) error
	GetSheepGenealogy(ctx context.Context, id int, maxGeneration int) (*Genealogy, error)
	GetSheepTypeList(ctx context.Context) ([]*SheepType, error)
	AddSheepType(ctx context.Context, t *SheepType) error
	UpdateSheepType(ctx context.Context, id int, t *SheepType) error
}
