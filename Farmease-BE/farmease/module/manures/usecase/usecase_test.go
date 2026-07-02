package usecase

import (
	"context"
	"testing"

	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

type mockManureRepo struct {
	manures map[string]*domain.Manure
}

func (m *mockManureRepo) FindAll(ctx context.Context, filter domain.ManureFilter) ([]*domain.Manure, int, error) {
	return nil, 0, nil
}
func (m *mockManureRepo) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Manure, error) {
	var list []*domain.Manure
	for _, mn := range m.manures {
		if mn.IDSheep == idSheep {
			list = append(list, mn)
		}
	}
	return list, nil
}
func (m *mockManureRepo) FindHistoryByCage(ctx context.Context, idCage string) ([]*domain.Manure, error) {
	var list []*domain.Manure
	for _, mn := range m.manures {
		if mn.IDCage == idCage {
			list = append(list, mn)
		}
	}
	return list, nil
}
func (m *mockManureRepo) Store(ctx context.Context, mn *domain.Manure) error {
	m.manures[mn.IDManure] = mn
	return nil
}

func TestGetManureHistory(t *testing.T) {
	repo := &mockManureRepo{
		manures: map[string]*domain.Manure{
			"m-1": {IDManure: "m-1", IDSheep: "sheep-1", Amount: 2.5, Unit: "kg"},
			"m-2": {IDManure: "m-2", IDSheep: "sheep-1", Amount: 3.0, Unit: "kg"},
		},
	}
	uc := NewUseCase(repo)

	history, err := uc.GetManureHistory(context.Background(), "sheep-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if len(history) != 2 {
		t.Errorf("Expected 2 records for sheep-1, got %d", len(history))
	}

	history, err = uc.GetManureHistory(context.Background(), "sheep-999")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if len(history) != 0 {
		t.Errorf("Expected 0 records for sheep-999, got %d", len(history))
	}
}

func TestRecordManure(t *testing.T) {
	repo := &mockManureRepo{
		manures: make(map[string]*domain.Manure),
	}
	uc := NewUseCase(repo)

	mn := &domain.Manure{
		IDManure: "m-new",
		IDSheep:  "sheep-1",
		Amount:   5.0,
		Unit:     "kg",
	}

	err := uc.RecordManure(context.Background(), mn)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.manures) != 1 {
		t.Errorf("Expected manure record to be stored, got map len %d", len(repo.manures))
	}
}
