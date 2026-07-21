package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/pembersihan/domain"
	"github.com/farmease/kebun-be/kebun/module/pembersihan/usecase"
)

type mockPembersihanRepo struct {
	items    []domain.Pembersihan
	storeErr error
	findErr  error
}

func (m *mockPembersihanRepo) FindAll(ctx context.Context) ([]domain.Pembersihan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPembersihanRepo) FindByID(ctx context.Context, id string) (*domain.Pembersihan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPembersihan == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPembersihanRepo) Store(ctx context.Context, p *domain.Pembersihan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPembersihan = "test-pembersihan-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPembersihanRepo) Update(ctx context.Context, p *domain.Pembersihan) error {
	for i, existing := range m.items {
		if existing.IDPembersihan == p.IDPembersihan {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPembersihanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPembersihan == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPembersihanRepo{
		items: []domain.Pembersihan{
			{IDPembersihan: "c1", TeknikPembersihan: "Manual"},
			{IDPembersihan: "c2", TeknikPembersihan: "Kimiawi"},
		},
	}
	uc := usecase.NewPembersihanUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPembersihanRepo{
		items: []domain.Pembersihan{
			{IDPembersihan: "c1", TeknikPembersihan: "Manual"},
		},
	}
	uc := usecase.NewPembersihanUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "c1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPembersihan != "c1" {
		t.Errorf("expected ID 'c1', got '%s'", res.IDPembersihan)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPembersihanRepo{}
	uc := usecase.NewPembersihanUsecase(repo, nil)

	newClean := &domain.Pembersihan{
		TeknikPembersihan: "Manual",
		LahanIDLahan:      "lahan-1",
	}

	err := uc.Create(context.Background(), newClean)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item, got %d", len(repo.items))
	}

	if repo.items[0].IDPembersihan != "test-pembersihan-uuid" {
		t.Errorf("expected ID, got '%s'", repo.items[0].IDPembersihan)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPembersihanRepo{
		items: []domain.Pembersihan{
			{IDPembersihan: "c1", TeknikPembersihan: "Manual"},
		},
	}
	uc := usecase.NewPembersihanUsecase(repo, nil)

	updateData := &domain.Pembersihan{
		IDPembersihan:     "c1",
		TeknikPembersihan: "Kombinasi",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].TeknikPembersihan != "Kombinasi" {
		t.Errorf("expected updated value 'Kombinasi', got '%s'", repo.items[0].TeknikPembersihan)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPembersihanRepo{
		items: []domain.Pembersihan{
			{IDPembersihan: "c1"},
		},
	}
	uc := usecase.NewPembersihanUsecase(repo, nil)

	err := uc.Delete(context.Background(), "c1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
