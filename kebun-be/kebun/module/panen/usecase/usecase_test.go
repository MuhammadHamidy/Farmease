package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/panen/domain"
	"github.com/farmease/kebun-be/kebun/module/panen/usecase"
)

type mockPanenRepo struct {
	items       []domain.Panen
	rekap       []domain.PanenRekap
	storeErr    error
	findErr     error
	findRekapErr error
}

func (m *mockPanenRepo) FindAll(ctx context.Context) ([]domain.Panen, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPanenRepo) FindByID(ctx context.Context, id string) (*domain.Panen, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPanen == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPanenRepo) FindRekap(ctx context.Context) ([]domain.PanenRekap, error) {
	if m.findRekapErr != nil {
		return nil, m.findRekapErr
	}
	return m.rekap, nil
}

func (m *mockPanenRepo) Store(ctx context.Context, p *domain.Panen) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPanen = "test-panen-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPanenRepo) Update(ctx context.Context, p *domain.Panen) error {
	for i, existing := range m.items {
		if existing.IDPanen == p.IDPanen {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPanenRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPanen == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPanenRepo{
		items: []domain.Panen{
			{IDPanen: "p1", Jumlah: 100},
			{IDPanen: "p2", Jumlah: 150},
		},
	}
	uc := usecase.NewPanenUsecase(repo)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPanenRepo{
		items: []domain.Panen{
			{IDPanen: "p1", Jumlah: 100},
		},
	}
	uc := usecase.NewPanenUsecase(repo)

	res, err := uc.FindByID(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPanen != "p1" {
		t.Errorf("expected ID 'p1', got '%s'", res.IDPanen)
	}
}

func TestFindRekap_Success(t *testing.T) {
	repo := &mockPanenRepo{
		rekap: []domain.PanenRekap{
			{Tahun: 2026, TotalJumlah: 1200, Satuan: "kg"},
		},
	}
	uc := usecase.NewPanenUsecase(repo)

	res, err := uc.FindRekap(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 rekap, got %d", len(res))
	}

	if res[0].Tahun != 2026 {
		t.Errorf("expected year 2026, got %d", res[0].Tahun)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPanenRepo{}
	uc := usecase.NewPanenUsecase(repo)

	newPanen := &domain.Panen{
		Jumlah:       50,
		Satuan:       "kg",
		LahanIDLahan: "lahan-uuid",
	}

	err := uc.Create(context.Background(), newPanen)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item, got %d", len(repo.items))
	}

	if repo.items[0].IDPanen != "test-panen-uuid" {
		t.Errorf("expected generated ID, got '%s'", repo.items[0].IDPanen)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPanenRepo{
		items: []domain.Panen{
			{IDPanen: "p1", Jumlah: 100},
		},
	}
	uc := usecase.NewPanenUsecase(repo)

	updateData := &domain.Panen{
		IDPanen: "p1",
		Jumlah:  200,
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].Jumlah != 200 {
		t.Errorf("expected updated amount 200, got %d", repo.items[0].Jumlah)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPanenRepo{
		items: []domain.Panen{
			{IDPanen: "p1"},
		},
	}
	uc := usecase.NewPanenUsecase(repo)

	err := uc.Delete(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
