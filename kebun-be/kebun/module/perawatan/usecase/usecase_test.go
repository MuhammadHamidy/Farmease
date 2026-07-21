package usecase_test

import (
	"context"
	"strings"
	"testing"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/perawatan/domain"
	"github.com/farmease/kebun-be/kebun/module/perawatan/usecase"
)

type mockPerawatanRepo struct {
	items    []domain.Perawatan
	storeErr error
	findErr  error
}

func (m *mockPerawatanRepo) FindAll(ctx context.Context) ([]domain.Perawatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPerawatanRepo) FindByID(ctx context.Context, id string) (*domain.Perawatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPerawatan == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPerawatanRepo) Store(ctx context.Context, p *domain.Perawatan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPerawatan = "test-perawatan-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPerawatanRepo) Update(ctx context.Context, p *domain.Perawatan) error {
	for i, existing := range m.items {
		if existing.IDPerawatan == p.IDPerawatan {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPerawatanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPerawatan == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPerawatanRepo{
		items: []domain.Perawatan{
			{IDPerawatan: "pr1", NamaJenisAktivitas: "Pemotongan Daun"},
		},
	}
	cfg := &config.InternalAppConfig{LivestockAPIURL: "http://localhost:8081/api/v1"}
	uc := usecase.NewPerawatanUsecase(repo, cfg, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 item, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPerawatanRepo{
		items: []domain.Perawatan{
			{IDPerawatan: "pr1", NamaJenisAktivitas: "Pemotongan Daun"},
		},
	}
	cfg := &config.InternalAppConfig{LivestockAPIURL: "http://localhost:8081/api/v1"}
	uc := usecase.NewPerawatanUsecase(repo, cfg, nil)

	res, err := uc.FindByID(context.Background(), "pr1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPerawatan != "pr1" {
		t.Errorf("expected ID 'pr1', got '%s'", res.IDPerawatan)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPerawatanRepo{}
	cfg := &config.InternalAppConfig{LivestockAPIURL: "http://localhost:8081/api/v1"}
	uc := usecase.NewPerawatanUsecase(repo, cfg, nil)

	newP := &domain.Perawatan{
		NamaJenisAktivitas: "Pemupukan",
		LahanIDLahan:       "lahan-uuid",
	}

	err := uc.Create(context.Background(), newP)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item, got %d", len(repo.items))
	}

	if repo.items[0].IDPerawatan != "test-perawatan-uuid" {
		t.Errorf("expected ID, got '%s'", repo.items[0].IDPerawatan)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPerawatanRepo{
		items: []domain.Perawatan{
			{IDPerawatan: "pr1", NamaJenisAktivitas: "Pemupukan"},
		},
	}
	cfg := &config.InternalAppConfig{LivestockAPIURL: "http://localhost:8081/api/v1"}
	uc := usecase.NewPerawatanUsecase(repo, cfg, nil)

	updateData := &domain.Perawatan{
		IDPerawatan:        "pr1",
		NamaJenisAktivitas: "Pemupukan",
		Deskripsi:          "Memakai pupuk organik",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].Deskripsi != "Memakai pupuk organik" {
		t.Errorf("expected updated deskripsi, got '%s'", repo.items[0].Deskripsi)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPerawatanRepo{
		items: []domain.Perawatan{
			{IDPerawatan: "pr1"},
		},
	}
	cfg := &config.InternalAppConfig{LivestockAPIURL: "http://localhost:8081/api/v1"}
	uc := usecase.NewPerawatanUsecase(repo, cfg, nil)

	err := uc.Delete(context.Background(), "pr1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}

func TestGetRekomendasiObat_Success(t *testing.T) {
	cfg := &config.InternalAppConfig{LivestockAPIURL: "http://localhost:8081/api/v1"}
	uc := usecase.NewPerawatanUsecase(nil, cfg, nil)

	res, err := uc.GetRekomendasiObat(context.Background(), "Alpukat", "Generatif", "Minyak Nimba")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(res, "Alpukat") || !strings.Contains(res, "Generatif") || !strings.Contains(res, "Minyak Nimba") {
		t.Errorf("unexpected output: %s", res)
	}
}
