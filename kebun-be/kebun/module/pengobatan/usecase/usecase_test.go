package usecase_test

import (
	"context"
	"strings"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/pengobatan/domain"
	"github.com/farmease/kebun-be/kebun/module/pengobatan/usecase"
)

type mockPengobatanRepo struct {
	items    []domain.Pengobatan
	storeErr error
	findErr  error
}

func (m *mockPengobatanRepo) FindAll(ctx context.Context) ([]domain.Pengobatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPengobatanRepo) FindByID(ctx context.Context, id string) (*domain.Pengobatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPengobatan == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPengobatanRepo) Store(ctx context.Context, p *domain.Pengobatan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPengobatan = "test-pengobatan-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPengobatanRepo) Update(ctx context.Context, p *domain.Pengobatan) error {
	for i, existing := range m.items {
		if existing.IDPengobatan == p.IDPengobatan {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPengobatanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPengobatan == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPengobatanRepo{
		items: []domain.Pengobatan{
			{IDPengobatan: "p1", NamaObat: "Fungisida"},
		},
	}
	uc := usecase.NewPengobatanUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 item, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPengobatanRepo{
		items: []domain.Pengobatan{
			{IDPengobatan: "p1", NamaObat: "Fungisida"},
		},
	}
	uc := usecase.NewPengobatanUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPengobatan != "p1" {
		t.Errorf("expected ID 'p1', got '%s'", res.IDPengobatan)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPengobatanRepo{}
	uc := usecase.NewPengobatanUsecase(repo, nil)

	newP := &domain.Pengobatan{
		NamaObat:     "Insektisida",
		LahanIDLahan: "lahan-1",
	}

	err := uc.Create(context.Background(), newP)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item, got %d", len(repo.items))
	}

	if repo.items[0].IDPengobatan != "test-pengobatan-uuid" {
		t.Errorf("expected ID, got '%s'", repo.items[0].IDPengobatan)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPengobatanRepo{
		items: []domain.Pengobatan{
			{IDPengobatan: "p1", NamaObat: "Fungisida"},
		},
	}
	uc := usecase.NewPengobatanUsecase(repo, nil)

	updateData := &domain.Pengobatan{
		IDPengobatan: "p1",
		NamaObat:     "Pestisida Organik",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].NamaObat != "Pestisida Organik" {
		t.Errorf("expected updated name, got '%s'", repo.items[0].NamaObat)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPengobatanRepo{
		items: []domain.Pengobatan{
			{IDPengobatan: "p1"},
		},
	}
	uc := usecase.NewPengobatanUsecase(repo, nil)

	err := uc.Delete(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}

func TestGetRekomendasiObat_Success(t *testing.T) {
	uc := usecase.NewPengobatanUsecase(nil, nil)

	res, err := uc.GetRekomendasiObat(context.Background(), "Kelengkeng", "Generatif", "Pestisida")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(res, "Kelengkeng") || !strings.Contains(res, "Generatif") || !strings.Contains(res, "Pestisida") {
		t.Errorf("unexpected recommendation output: %s", res)
	}
}
