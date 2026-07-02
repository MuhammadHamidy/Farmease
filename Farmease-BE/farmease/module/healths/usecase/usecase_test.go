package usecase

import (
	"context"
	"testing"

	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)

type mockHealthRepo struct {
	healths map[string]*domain.Health
}

func (m *mockHealthRepo) FindAll(ctx context.Context, filter domain.HealthFilter) ([]*domain.Health, int, error) {
	return nil, 0, nil
}
func (m *mockHealthRepo) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Health, error) {
	var list []*domain.Health
	for _, h := range m.healths {
		if h.IDSheep == idSheep {
			list = append(list, h)
		}
	}
	return list, nil
}
func (m *mockHealthRepo) Store(ctx context.Context, k *domain.Health) error {
	m.healths[k.IDHealth] = k
	return nil
}
func (m *mockHealthRepo) Update(ctx context.Context, k *domain.Health) error {
	return nil
}

func TestGetHealthHistory(t *testing.T) {
	repo := &mockHealthRepo{
		healths: map[string]*domain.Health{
			"health-1": {IDHealth: "health-1", IDSheep: "sheep-1", Diagnosis: "Flu"},
			"health-2": {IDHealth: "health-2", IDSheep: "sheep-1", Diagnosis: "Demam"},
			"health-3": {IDHealth: "health-3", IDSheep: "sheep-2", Diagnosis: "Sehat"},
		},
	}
	uc := NewUseCase(repo)

	history, err := uc.GetHealthHistory(context.Background(), "sheep-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if len(history) != 2 {
		t.Errorf("Expected 2 records for sheep-1, got %d", len(history))
	}

	history, err = uc.GetHealthHistory(context.Background(), "sheep-3")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if len(history) != 0 {
		t.Errorf("Expected 0 records for sheep-3, got %d", len(history))
	}
}

func TestRecordHealth(t *testing.T) {
	repo := &mockHealthRepo{
		healths: make(map[string]*domain.Health),
	}
	uc := NewUseCase(repo)

	health := &domain.Health{
		IDHealth:  "health-new",
		IDSheep:   "sheep-1",
		Diagnosis: "Cacingan",
	}

	err := uc.RecordHealth(context.Background(), health)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.healths) != 1 {
		t.Errorf("Expected health record to be stored, got map len %d", len(repo.healths))
	}
}
