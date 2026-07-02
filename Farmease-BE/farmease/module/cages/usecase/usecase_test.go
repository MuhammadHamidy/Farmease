package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

type mockCageRepo struct {
	cages map[string]*domain.Cage
}

func (m *mockCageRepo) FindAll(ctx context.Context, filter domain.CageFilter) ([]*domain.Cage, int, error) {
	return nil, 0, nil
}
func (m *mockCageRepo) FindByID(ctx context.Context, id string) (*domain.Cage, error) {
	if c, ok := m.cages[id]; ok {
		return c, nil
	}
	return nil, errors.New("not found")
}
func (m *mockCageRepo) FindByCode(ctx context.Context, code string) (*domain.Cage, error) {
	return nil, nil
}
func (m *mockCageRepo) Store(ctx context.Context, cage *domain.Cage) error {
	m.cages[cage.IDCage] = cage
	return nil
}
func (m *mockCageRepo) Update(ctx context.Context, cage *domain.Cage) error {
	return nil
}
func (m *mockCageRepo) Delete(ctx context.Context, id string) error {
	return nil
}
func (m *mockCageRepo) GetOccupancy(ctx context.Context, id string) (int, error) {
	return 0, nil
}
func (m *mockCageRepo) GetCageStats(ctx context.Context, id string) (*domain.CageStats, error) {
	return nil, nil
}
func (m *mockCageRepo) GetCageWeightStats(ctx context.Context, id string) (*domain.CageWeightStats, error) {
	return nil, nil
}

func TestGetCageDetail(t *testing.T) {
	repo := &mockCageRepo{
		cages: map[string]*domain.Cage{
			"cage-1": {IDCage: "cage-1", CageName: "Kandang A"},
		},
	}
	uc := NewUseCase(repo)

	cage, err := uc.GetCageDetail(context.Background(), "cage-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if cage == nil || cage.CageName != "Kandang A" {
		t.Errorf("Expected Kandang A, got %v", cage)
	}

	cage, err = uc.GetCageDetail(context.Background(), "cage-2")
	if err == nil {
		t.Errorf("Expected error for non-existent cage")
	}
}
