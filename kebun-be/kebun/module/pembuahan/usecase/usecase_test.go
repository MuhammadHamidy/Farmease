package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/pembuahan/domain"
	"github.com/farmease/kebun-be/kebun/module/pembuahan/usecase"
)

type mockPembuahanRepo struct {
	items    []domain.Pembuahan
	storeErr error
	findErr  error
}

func (m *mockPembuahanRepo) FindAll(ctx context.Context) ([]domain.Pembuahan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPembuahanRepo) FindByID(ctx context.Context, id string) (*domain.Pembuahan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPembuahan == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPembuahanRepo) Store(ctx context.Context, p *domain.Pembuahan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPembuahan = "test-pembuahan-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPembuahanRepo) Update(ctx context.Context, p *domain.Pembuahan) error {
	for i, existing := range m.items {
		if existing.IDPembuahan == p.IDPembuahan {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPembuahanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPembuahan == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPembuahanRepo{
		items: []domain.Pembuahan{
			{IDPembuahan: "f1", TeknikPembuahan: "Hormon"},
			{IDPembuahan: "f2", TeknikPembuahan: "Stres Air"},
		},
	}
	uc := usecase.NewPembuahanUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPembuahanRepo{
		items: []domain.Pembuahan{
			{IDPembuahan: "f1", TeknikPembuahan: "Hormon"},
		},
	}
	uc := usecase.NewPembuahanUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "f1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPembuahan != "f1" {
		t.Errorf("expected ID 'f1', got '%s'", res.IDPembuahan)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPembuahanRepo{}
	uc := usecase.NewPembuahanUsecase(repo, nil)

	newP := &domain.Pembuahan{
		TeknikPembuahan: "Stres Air",
		LahanIDLahan:    "lahan-uuid",
	}

	err := uc.Create(context.Background(), newP)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item stored, got %d", len(repo.items))
	}

	if repo.items[0].IDPembuahan != "test-pembuahan-uuid" {
		t.Errorf("expected generated ID 'test-pembuahan-uuid', got '%s'", repo.items[0].IDPembuahan)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPembuahanRepo{
		items: []domain.Pembuahan{
			{IDPembuahan: "f1", TeknikPembuahan: "Hormon"},
		},
	}
	uc := usecase.NewPembuahanUsecase(repo, nil)

	updateData := &domain.Pembuahan{
		IDPembuahan:     "f1",
		TeknikPembuahan: "Nutrisi Lengkap",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error updating: %v", err)
	}

	if repo.items[0].TeknikPembuahan != "Nutrisi Lengkap" {
		t.Errorf("expected updated value to be 'Nutrisi Lengkap', got '%s'", repo.items[0].TeknikPembuahan)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPembuahanRepo{
		items: []domain.Pembuahan{
			{IDPembuahan: "f1"},
		},
	}
	uc := usecase.NewPembuahanUsecase(repo, nil)

	err := uc.Delete(context.Background(), "f1")
	if err != nil {
		t.Fatalf("unexpected error deleting: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
