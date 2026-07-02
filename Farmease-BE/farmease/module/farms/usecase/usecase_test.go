package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/farmease-be/farmease/module/farms/domain"
	"github.com/google/uuid"
)

type mockFarmRepo struct {
	farms map[uuid.UUID]*domain.Farm
}

func (m *mockFarmRepo) Store(ctx context.Context, farm *domain.Farm) error {
	m.farms[farm.ID] = farm
	return nil
}
func (m *mockFarmRepo) FindAll(ctx context.Context, param *domain.FarmParam) ([]*domain.Farm, int, error) {
	return nil, 0, nil
}
func (m *mockFarmRepo) FindByID(ctx context.Context, id uuid.UUID) (*domain.Farm, error) {
	if f, ok := m.farms[id]; ok {
		return f, nil
	}
	return nil, errors.New("not found")
}
func (m *mockFarmRepo) FindByCode(ctx context.Context, code string) (*domain.Farm, error) {
	return nil, nil
}
func (m *mockFarmRepo) Update(ctx context.Context, farm *domain.Farm) error {
	m.farms[farm.ID] = farm
	return nil
}
func (m *mockFarmRepo) Delete(ctx context.Context, id uuid.UUID, deletedBy string) error {
	return nil
}

func TestFindByID(t *testing.T) {
	id := uuid.New()
	repo := &mockFarmRepo{
		farms: map[uuid.UUID]*domain.Farm{
			id: {ID: id, Name: "Farm Sentosa"},
		},
	}
	uc := NewUseCase(repo)

	farm, err := uc.FindByID(context.Background(), id)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if farm == nil || farm.Name != "Farm Sentosa" {
		t.Errorf("Expected Farm Sentosa, got %v", farm)
	}

	farm, err = uc.FindByID(context.Background(), uuid.New())
	if err == nil {
		t.Errorf("Expected error for non-existent farm")
	}
}

func TestCreate(t *testing.T) {
	repo := &mockFarmRepo{
		farms: make(map[uuid.UUID]*domain.Farm),
	}
	uc := NewUseCase(repo)

	id := uuid.New()
	farm := &domain.Farm{
		ID:   id,
		Name: "Farm Makmur",
	}

	err := uc.Create(context.Background(), farm)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.farms) != 1 {
		t.Errorf("Expected farm to be stored, got map len %d", len(repo.farms))
	}
}
