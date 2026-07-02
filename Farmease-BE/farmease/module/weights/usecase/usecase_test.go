package usecase

import (
	"context"
	"testing"

	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)

type mockWeightRepo struct {
	weights map[string]*domain.Weight
}

func (m *mockWeightRepo) FindAll(ctx context.Context, filter domain.WeightFilter) ([]*domain.Weight, int, error) {
	return nil, 0, nil
}
func (m *mockWeightRepo) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Weight, error) {
	var list []*domain.Weight
	for _, w := range m.weights {
		if w.IDSheep == idSheep {
			list = append(list, w)
		}
	}
	return list, nil
}
func (m *mockWeightRepo) Store(ctx context.Context, w *domain.Weight) error {
	m.weights[w.IDWeight] = w
	return nil
}

func TestGetWeightHistory(t *testing.T) {
	repo := &mockWeightRepo{
		weights: map[string]*domain.Weight{
			"w-1": {IDWeight: "w-1", IDSheep: "sheep-1", WeightKg: 10},
			"w-2": {IDWeight: "w-2", IDSheep: "sheep-1", WeightKg: 15},
		},
	}
	uc := NewUseCase(repo)

	history, err := uc.GetWeightHistory(context.Background(), "sheep-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if len(history) != 2 {
		t.Errorf("Expected 2 records for sheep-1, got %d", len(history))
	}

	history, err = uc.GetWeightHistory(context.Background(), "sheep-999")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if len(history) != 0 {
		t.Errorf("Expected 0 records for sheep-999, got %d", len(history))
	}
}

func TestRecordWeight(t *testing.T) {
	repo := &mockWeightRepo{
		weights: make(map[string]*domain.Weight),
	}
	uc := NewUseCase(repo)

	w := &domain.Weight{
		IDWeight: "w-new",
		IDSheep:  "sheep-1",
		WeightKg: 12.5,
	}

	err := uc.RecordWeight(context.Background(), w)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.weights) != 1 {
		t.Errorf("Expected weight record to be stored, got map len %d", len(repo.weights))
	}
}
