package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/penyiraman/domain"
	"github.com/farmease/kebun-be/kebun/module/penyiraman/usecase"
)

type mockPenyiramanRepo struct {
	items    []domain.Penyiraman
	storeErr error
	findErr  error
}

func (m *mockPenyiramanRepo) FindAll(ctx context.Context) ([]domain.Penyiraman, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPenyiramanRepo) FindByID(ctx context.Context, id string) (*domain.Penyiraman, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPenyiraman == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPenyiramanRepo) Store(ctx context.Context, p *domain.Penyiraman) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPenyiraman = "test-penyiraman-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPenyiramanRepo) Update(ctx context.Context, p *domain.Penyiraman) error {
	for i, existing := range m.items {
		if existing.IDPenyiraman == p.IDPenyiraman {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPenyiramanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPenyiraman == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPenyiramanRepo{
		items: []domain.Penyiraman{
			{IDPenyiraman: "w1", TeknikPenyiraman: "Manual"},
			{IDPenyiraman: "w2", TeknikPenyiraman: "Drip"},
		},
	}
	uc := usecase.NewPenyiramanUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPenyiramanRepo{
		items: []domain.Penyiraman{
			{IDPenyiraman: "w1", TeknikPenyiraman: "Manual"},
		},
	}
	uc := usecase.NewPenyiramanUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "w1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res == nil {
		t.Fatal("expected non-nil item")
	}

	if res.IDPenyiraman != "w1" {
		t.Errorf("expected ID 'w1', got '%s'", res.IDPenyiraman)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPenyiramanRepo{}
	uc := usecase.NewPenyiramanUsecase(repo, nil)

	newP := &domain.Penyiraman{
		TeknikPenyiraman: "Sprinkler",
		LahanIDLahan:     "lahan-1",
	}

	err := uc.Create(context.Background(), newP)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item, got %d", len(repo.items))
	}

	if repo.items[0].IDPenyiraman != "test-penyiraman-uuid" {
		t.Errorf("expected ID, got '%s'", repo.items[0].IDPenyiraman)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPenyiramanRepo{
		items: []domain.Penyiraman{
			{IDPenyiraman: "w1", TeknikPenyiraman: "Manual"},
		},
	}
	uc := usecase.NewPenyiramanUsecase(repo, nil)

	updateData := &domain.Penyiraman{
		IDPenyiraman:     "w1",
		TeknikPenyiraman: "Otomatis Drip",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].TeknikPenyiraman != "Otomatis Drip" {
		t.Errorf("expected updated value, got '%s'", repo.items[0].TeknikPenyiraman)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPenyiramanRepo{
		items: []domain.Penyiraman{
			{IDPenyiraman: "w1"},
		},
	}
	uc := usecase.NewPenyiramanUsecase(repo, nil)

	err := uc.Delete(context.Background(), "w1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
