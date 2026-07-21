package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/penanaman/domain"
	"github.com/farmease/kebun-be/kebun/module/penanaman/usecase"
)

type mockPenanamanRepo struct {
	items    []domain.Penanaman
	storeErr error
	findErr  error
}

func (m *mockPenanamanRepo) FindAll(ctx context.Context) ([]domain.Penanaman, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPenanamanRepo) FindByID(ctx context.Context, id string) (*domain.Penanaman, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPenanaman == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPenanamanRepo) Store(ctx context.Context, p *domain.Penanaman) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPenanaman = "test-penanaman-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPenanamanRepo) Update(ctx context.Context, p *domain.Penanaman) error {
	for i, existing := range m.items {
		if existing.IDPenanaman == p.IDPenanaman {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPenanamanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPenanaman == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPenanamanRepo{
		items: []domain.Penanaman{
			{IDPenanaman: "pt1", Varietas: "Avocado Aligator"},
			{IDPenanaman: "pt2", Varietas: "Longan Diamond River"},
		},
	}
	uc := usecase.NewPenanamanUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPenanamanRepo{
		items: []domain.Penanaman{
			{IDPenanaman: "pt1", Varietas: "Avocado Aligator"},
		},
	}
	uc := usecase.NewPenanamanUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "pt1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPenanaman != "pt1" {
		t.Errorf("expected ID 'pt1', got '%s'", res.IDPenanaman)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPenanamanRepo{}
	uc := usecase.NewPenanamanUsecase(repo, nil)

	newP := &domain.Penanaman{
		Varietas:     "Avocado Aligator",
		LahanIDLahan: "lahan-1",
	}

	err := uc.Create(context.Background(), newP)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item stored, got %d", len(repo.items))
	}

	if repo.items[0].IDPenanaman != "test-penanaman-uuid" {
		t.Errorf("expected ID, got '%s'", repo.items[0].IDPenanaman)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPenanamanRepo{
		items: []domain.Penanaman{
			{IDPenanaman: "pt1", Varietas: "Avocado Aligator"},
		},
	}
	uc := usecase.NewPenanamanUsecase(repo, nil)

	updateData := &domain.Penanaman{
		IDPenanaman: "pt1",
		Varietas:    "Avocado Hass",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].Varietas != "Avocado Hass" {
		t.Errorf("expected updated varietas 'Avocado Hass', got '%s'", repo.items[0].Varietas)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPenanamanRepo{
		items: []domain.Penanaman{
			{IDPenanaman: "pt1"},
		},
	}
	uc := usecase.NewPenanamanUsecase(repo, nil)

	err := uc.Delete(context.Background(), "pt1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
