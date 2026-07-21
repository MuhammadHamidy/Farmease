package domain

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

type Sheep struct {
	IDSheep         string     `json:"id_sheep" db:"id_sheep"`
	SheepCode       string     `json:"sheep_code" db:"sheep_code" validate:"required"`
	SheepName       string     `json:"sheep_name" db:"sheep_name" validate:"required"`
	Gender          string     `json:"gender" db:"gender" validate:"required,oneof=jantan betina"`
	DateOfBirth     *time.Time `json:"date_of_birth" db:"date_of_birth"`
	UmurMethod      string     `json:"umur_method,omitempty" db:"-"`
	PoelLevel       string     `json:"poel_level,omitempty" db:"-"`
	AgeDays         int        `json:"age_days,omitempty"`
	AgeMonths       float64    `json:"age_months,omitempty"`
	AgeString       string     `json:"age_string,omitempty"`
	IsReadyToMate   bool       `json:"is_ready_to_mate,omitempty" db:"-"`
	MatingStatus    string     `json:"mating_status,omitempty" db:"-"`
	Status          string     `json:"status" db:"status" validate:"required"`
	Origin          string     `json:"origin" db:"origin" validate:"required"`
	IDCage          string     `json:"id_cage" db:"id_cage" validate:"required"`
	IDType          string     `json:"id_type" db:"id_type" validate:"required"`
	IDFather        *string    `json:"id_father" db:"id_father"`
	IDMother        *string    `json:"id_mother" db:"id_mother"`
	FirstWeight     float64    `json:"-" db:"first_weight"`
	FirstWeightDate *time.Time `json:"-" db:"first_weight_date"`
	LastWeight      float64    `json:"last_weight" db:"last_weight"`
	LastWeightDate  *time.Time `json:"-" db:"last_weight_date"`
	TypeName        string     `json:"type_name,omitempty" db:"type_name"`
	ADG             *int       `json:"adg,omitempty"`
	ADGLabel        string     `json:"adg_label,omitempty"`
	PhotoURL        string     `json:"photo_url,omitempty" db:"photo_url"`
	Owner           string     `json:"owner" db:"owner"`
	Father          *Parent    `json:"father,omitempty"`
	Mother          *Parent    `json:"mother,omitempty"`
	CreatedBy       *string    `json:"created_by,omitempty" db:"created_by"`
	UpdatedBy       *string    `json:"updated_by,omitempty" db:"updated_by"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

func (s *Sheep) UnmarshalJSON(data []byte) error {
	type Alias Sheep
	aux := &struct {
		DateOfBirth *string `json:"date_of_birth"`
		Alias
	}{
		Alias: Alias(*s),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	*s = Sheep(aux.Alias)

	if aux.DateOfBirth != nil && *aux.DateOfBirth != "" && *aux.DateOfBirth != "null" {
		strVal := strings.TrimSpace(*aux.DateOfBirth)
		layouts := []string{
			"2006-01-02T15:04:05Z07:00",
			"2006-01-02T15:04:05.999Z",
			"2006-01-02T15:04:05.999Z07:00",
			"2006-01-02",
			"02-01-2006",
			"02/01/2006",
			"2006/01/02",
			time.RFC3339,
		}
		var parsedTime time.Time
		var err error
		success := false
		for _, layout := range layouts {
			parsedTime, err = time.Parse(layout, strVal)
			if err == nil {
				s.DateOfBirth = &parsedTime
				success = true
				break
			}
		}
		if !success {
			return fmt.Errorf("failed to parse date_of_birth %q: %v", strVal, err)
		}
	}
	return nil
}

type Parent struct {
	IDSheep   string `json:"id_sheep"`
	SheepName string `json:"sheep_name"`
}

type SheepFilter struct {
	IDCage  string
	Gender  string
	Status  string
	Search  string
	Page    int
	PerPage int
}

type Sibling struct {
	IDSheep   string `json:"id_sheep"`
	SheepCode string `json:"sheep_code"`
	SheepName string `json:"sheep_name"`
	Gender    string `json:"gender"`
	Type      string `json:"type"` // "kandung", "tiri_bapak", "tiri_ibu"
}

type Genealogy struct {
	IDSheep   string     `json:"id_sheep"`
	SheepCode string     `json:"sheep_code"`
	SheepName string     `json:"sheep_name"`
	Gender    string     `json:"gender"`
	Father    *Genealogy `json:"father,omitempty"`
	Mother    *Genealogy `json:"mother,omitempty"`
	Siblings  []Sibling  `json:"siblings,omitempty"`
}

type SheepType struct {
	IDType          string    `json:"id_type" db:"id_type"`
	TypeName        string    `json:"type_name" db:"type_name"`
	TypeDescription string    `json:"type_description" db:"type_description"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type SheepRepository interface {
	FindAll(ctx context.Context, filter SheepFilter) ([]*Sheep, int, error)
	FindByID(ctx context.Context, id string) (*Sheep, error)
	FindByCode(ctx context.Context, code string) (*Sheep, error)
	FindExternalDonor(ctx context.Context, name, origin string) (*Sheep, error)
	Store(ctx context.Context, s *Sheep) error
	Update(ctx context.Context, s *Sheep) error
	UpdateStatus(ctx context.Context, id string, status string, notes string) error
	GetGenealogy(ctx context.Context, id string, maxGeneration int) (*Genealogy, error)
	FindAllTypes(ctx context.Context) ([]*SheepType, error)
	StoreType(ctx context.Context, t *SheepType) error
	UpdateType(ctx context.Context, id string, t *SheepType) error
	GetMatingStatusData(ctx context.Context) (activeMatingFemales map[string]bool, pendingMatingSheeps map[string]bool, latestEstrusChecks map[string]string, err error)
}

type UseCase interface {
	GetSheepList(ctx context.Context, filter SheepFilter) ([]*Sheep, int, error)
	RegisterSheep(ctx context.Context, s *Sheep) error
	GetOrCreateExternalDonor(ctx context.Context, name, origin string) (*Sheep, error)
	GetSheepDetail(ctx context.Context, id string) (*Sheep, error)
	UpdateSheep(ctx context.Context, id string, s *Sheep) error
	UpdateSheepStatus(ctx context.Context, id string, status string, notes string) error
	GetSheepGenealogy(ctx context.Context, id string, maxGeneration int) (*Genealogy, error)
	GetSheepTypeList(ctx context.Context) ([]*SheepType, error)
	AddSheepType(ctx context.Context, t *SheepType) error
	UpdateSheepType(ctx context.Context, id string, t *SheepType) error
}
