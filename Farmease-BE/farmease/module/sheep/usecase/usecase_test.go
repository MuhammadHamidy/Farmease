package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

type mockSheepRepo struct {
	sheepStore map[string]*domain.Sheep
}

func (m *mockSheepRepo) FindAll(ctx context.Context, filter domain.SheepFilter) ([]*domain.Sheep, int, error) {
	return nil, 0, nil
}
func (m *mockSheepRepo) FindByID(ctx context.Context, id string) (*domain.Sheep, error) {
	if s, ok := m.sheepStore[id]; ok {
		return s, nil
	}
	return nil, errors.New("not found")
}
func (m *mockSheepRepo) FindByCode(ctx context.Context, code string) (*domain.Sheep, error) {
	return nil, nil
}
func (m *mockSheepRepo) FindExternalDonor(ctx context.Context, name, origin string) (*domain.Sheep, error) {
	return nil, nil
}
func (m *mockSheepRepo) Store(ctx context.Context, s *domain.Sheep) error {
	if s.IDSheep == "" {
		s.IDSheep = "sheep-1"
	}
	m.sheepStore[s.IDSheep] = s
	return nil
}
func (m *mockSheepRepo) Update(ctx context.Context, s *domain.Sheep) error {
	m.sheepStore[s.IDSheep] = s
	return nil
}
func (m *mockSheepRepo) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	if s, ok := m.sheepStore[id]; ok {
		s.Status = status
	}
	return nil
}
func (m *mockSheepRepo) GetGenealogy(ctx context.Context, id string, maxGeneration int) (*domain.Genealogy, error) {
	return nil, nil
}
func (m *mockSheepRepo) FindAllTypes(ctx context.Context) ([]*domain.SheepType, error) {
	return nil, nil
}
func (m *mockSheepRepo) StoreType(ctx context.Context, t *domain.SheepType) error {
	return nil
}
func (m *mockSheepRepo) UpdateType(ctx context.Context, id string, t *domain.SheepType) error {
	return nil
}
func (m *mockSheepRepo) GetMatingStatusData(ctx context.Context) (map[string]bool, map[string]bool, map[string]string, error) { return nil, nil, nil, nil }

func TestGetSheepDetail(t *testing.T) {
	repo := &mockSheepRepo{
		sheepStore: map[string]*domain.Sheep{
			"sheep-1": {IDSheep: "sheep-1", SheepCode: "S001", SheepName: "Shaun"},
		},
	}
	uc := NewUseCase(repo)

	sheep, err := uc.GetSheepDetail(context.Background(), "sheep-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if sheep == nil || sheep.SheepName != "Shaun" {
		t.Errorf("Expected Shaun, got %v", sheep)
	}

	sheep, err = uc.GetSheepDetail(context.Background(), "sheep-404")
	if err == nil {
		t.Errorf("Expected error for non-existent sheep")
	}
}

func TestRegisterSheep(t *testing.T) {
	repo := &mockSheepRepo{
		sheepStore: make(map[string]*domain.Sheep),
	}
	uc := NewUseCase(repo)

	sheep := &domain.Sheep{
		SheepCode: "S002",
		SheepName: "Timmy",
		Gender:    "Jantan",
	}

	err := uc.RegisterSheep(context.Background(), sheep)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.sheepStore) != 1 {
		t.Errorf("Expected sheep to be stored, got map len %d", len(repo.sheepStore))
	}
}

func TestUpdateSheepStatus(t *testing.T) {
	repo := &mockSheepRepo{
		sheepStore: map[string]*domain.Sheep{
			"sheep-1": {IDSheep: "sheep-1", Status: "Aktif"},
		},
	}
	uc := NewUseCase(repo)

	err := uc.UpdateSheepStatus(context.Background(), "sheep-1", "Mati", "Sakit")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if repo.sheepStore["sheep-1"].Status != "Mati" {
		t.Errorf("Expected status to be Mati, got %v", repo.sheepStore["sheep-1"].Status)
	}
}
