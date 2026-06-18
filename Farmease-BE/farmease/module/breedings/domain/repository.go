package domain

import (
	"context"
	"time"
)

type Mating struct {
	IDMating                string      `json:"id_mating" db:"id_mating"`
	IDSheepMale             string      `json:"id_sheep_male" db:"id_sheep_male"`
	IDSheepFemale           string      `json:"id_sheep_female" db:"id_sheep_female"`
	MatingDate              time.Time   `json:"mating_date" db:"mating_date"`
	MatingMethod            string      `json:"mating_method" db:"mating_method"`
	Status                  string      `json:"status" db:"status"`
	InbreedingFlag          bool        `json:"inbreeding_flag" db:"inbreeding_flag"`
	CoefficientOfInbreeding float64     `json:"coefficient_of_inbreeding" db:"coefficient_of_inbreeding"`
	Notes                   string      `json:"notes" db:"notes"`
	StrawCode               string      `json:"straw_code" db:"straw_code"`
	Inseminator             string      `json:"inseminator" db:"inseminator"`
	ExternalDonor           *ExternalDonor `json:"external_donor,omitempty" db:"-"`
	MaleSheep               *SheepShort `json:"male_sheep,omitempty"`
	FemaleSheep             *SheepShort `json:"female_sheep,omitempty"`
	DaysSinceMating         int         `json:"days_since_mating,omitempty" db:"-"`
	CreatedAt               time.Time   `json:"created_at" db:"created_at"`
	UpdatedAt               time.Time   `json:"updated_at" db:"updated_at"`
}

type ExternalDonor struct {
	Name   string `json:"name"`
	Origin string `json:"origin"`
}

type SheepShort struct {
	IDSheep   string `json:"id_sheep"`
	SheepName string `json:"sheep_name"`
}

type InbreedingCheckRequest struct {
	IDSheepMale   string `json:"id_sheep_male"`
	IDSheepFemale string `json:"id_sheep_female"`
}

type InbreedingCheckResponse struct {
	IDMale                  string           `json:"id_male"`
	IDFemale                string           `json:"id_female"`
	CoefficientOfInbreeding float64          `json:"coefficient_of_inbreeding"`
	InbreedingPercentage    float64          `json:"inbreeding_percentage"`
	InbreedingFlag          bool             `json:"inbreeding_flag"`
	RiskLevel               string           `json:"risk_level"`
	RiskCategory            string           `json:"risk_category"`
	CommonAncestors         []CommonAncestor `json:"common_ancestors"`
	Recommendation          string           `json:"recommendation"`
}

type CommonAncestor struct {
	IDSheep   string   `json:"id_sheep"`
	SheepName string   `json:"sheep_name"`
	Paths     []string `json:"paths"`
}

type BreedingRepository interface {
	FindAll(ctx context.Context, status string, inbreedingFlag *bool) ([]*Mating, error)
	FindByID(ctx context.Context, id string) (*Mating, error)
	Store(ctx context.Context, p *Mating) error
	UpdateStatus(ctx context.Context, id string, status string, notes string) error
	GetAncestors(ctx context.Context, id string, maxGeneration int) (map[string][]int, error) // map[id_ancestor]paths_to_ancestor
}

type UseCase interface {
	CheckInbreeding(ctx context.Context, req InbreedingCheckRequest) (*InbreedingCheckResponse, error)
	GetMatingList(ctx context.Context, status string, inbreedingFlag *bool) ([]*Mating, error)
	RecordMating(ctx context.Context, p *Mating) error
	GetMatingDetail(ctx context.Context, id string) (*Mating, error)
	UpdateMatingStatus(ctx context.Context, id string, status string, notes string) error
}
