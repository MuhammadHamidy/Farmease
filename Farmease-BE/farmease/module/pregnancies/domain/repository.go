package domain

import (
	"context"
	"time"
)

type Pregnancy struct {
	IDPregnancy        int        `json:"id_pregnancy" db:"id_pregnancy"`
	IDMating           int        `json:"id_mating" db:"id_mating"`
	PregnancyDate      time.Time  `json:"pregnancy_date" db:"pregnancy_date"`
	PregnancyStatus    string     `json:"pregnancy_status" db:"pregnancy_status"`
	ExpectedBirthDate  *time.Time `json:"expected_birth_date" db:"expected_birth_date"`
	DaysRemaining      int        `json:"days_remaining"`
	Notes              string     `json:"notes" db:"notes"`
	IDSire             int        `json:"id_sire"`
	IDDam              int        `json:"id_dam"`
	DamSheep           *SheepShort `json:"dam_sheep,omitempty"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at" db:"updated_at"`
}

type Birth struct {
	IDBirth            int            `json:"id_birth" db:"id_birth"`
	IDPregnancy        int            `json:"id_pregnancy" db:"id_pregnancy"`
	BirthDate          time.Time      `json:"birth_date" db:"birth_date"`
	NumberOfOffspring  int            `json:"number_of_offspring" db:"number_of_offspring"`
	OffspringGender    string         `json:"offspring_gender" db:"offspring_gender"`
	OffspringCondition string         `json:"offspring_condition" db:"offspring_condition"`
	Notes              string         `json:"notes" db:"notes"`
	OffspringList      []NewOffspring `json:"offspring_list,omitempty"`
	CreatedAt          time.Time      `json:"created_at" db:"created_at"`
}

type SheepShort struct {
	IDSheep   int    `json:"id_sheep"`
	SheepName string `json:"sheep_name"`
}

type NewOffspring struct {
	SheepCode   string  `json:"sheep_code"`
	SheepName   string  `json:"sheep_name"`
	Gender      string  `json:"gender"`
	IDCage      int     `json:"id_cage"`
	BirthWeight float64 `json:"birth_weight"`
}

type PregnancyRepository interface {
	FindAllPregnancies(ctx context.Context, status string) ([]*Pregnancy, error)
	StorePregnancy(ctx context.Context, k *Pregnancy) error
	UpdatePregnancyStatus(ctx context.Context, id int, status string, notes string) error
	StoreBirth(ctx context.Context, k *Birth) error
	StoreBirthWeight(ctx context.Context, idSheep int, date time.Time, weight float64) error
	FindAllBirths(ctx context.Context, from, to *time.Time) ([]*Birth, error)
	GetPregnancyDetail(ctx context.Context, id int) (*Pregnancy, error)
}

type UseCase interface {
	RecordPregnancy(ctx context.Context, k *Pregnancy) error
	GetPregnancyList(ctx context.Context, status string) ([]*Pregnancy, error)
	UpdatePregnancyStatus(ctx context.Context, id int, status string, notes string) error
	RecordBirth(ctx context.Context, k *Birth) error
	GetBirthHistory(ctx context.Context, from, to *time.Time) ([]*Birth, error)
}
