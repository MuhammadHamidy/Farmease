package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/pemupukan/domain"
	"github.com/farmease/kebun-be/kebun/module/pemupukan/usecase"
)

type mockPemupukanRepo struct {
	items    []*domain.Pemupukan
	storeErr error
	findErr  error
}

func (m *mockPemupukanRepo) FindAll(ctx context.Context) ([]*domain.Pemupukan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPemupukanRepo) FindByID(ctx context.Context, id string) (*domain.Pemupukan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPemupukan == id {
			return p, nil
		}
	}
	return nil, nil
}

func (m *mockPemupukanRepo) Store(ctx context.Context, p *domain.Pemupukan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPemupukan = "test-pemupukan-uuid"
	m.items = append(m.items, p)
	return nil
}

func (m *mockPemupukanRepo) Update(ctx context.Context, p *domain.Pemupukan) error {
	for i, existing := range m.items {
		if existing.IDPemupukan == p.IDPemupukan {
			m.items[i] = p
			return nil
		}
	}
	return nil
}

func (m *mockPemupukanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPemupukan == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPemupukanRepo{
		items: []*domain.Pemupukan{
			{IDPemupukan: "p1", NamaPupuk: "Kompos", Dosis: 5.0},
			{IDPemupukan: "p2", NamaPupuk: "Urea", Dosis: 1.0},
		},
	}
	uc := usecase.NewPemupukanUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPemupukanRepo{
		items: []*domain.Pemupukan{
			{IDPemupukan: "p1", NamaPupuk: "Kompos"},
		},
	}
	uc := usecase.NewPemupukanUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPemupukan != "p1" {
		t.Errorf("expected ID 'p1', got '%s'", res.IDPemupukan)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPemupukanRepo{}
	uc := usecase.NewPemupukanUsecase(repo, nil)

	newP := &domain.Pemupukan{
		NamaPupuk:    "Kompos",
		Dosis:        5.0,
		Satuan:       "kg",
		LahanIDLahan: "lahan-1",
	}

	err := uc.Create(context.Background(), newP)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item, got %d", len(repo.items))
	}

	if repo.items[0].IDPemupukan != "test-pemupukan-uuid" {
		t.Errorf("expected generated ID, got '%s'", repo.items[0].IDPemupukan)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPemupukanRepo{
		items: []*domain.Pemupukan{
			{IDPemupukan: "p1", NamaPupuk: "Kompos"},
		},
	}
	uc := usecase.NewPemupukanUsecase(repo, nil)

	updateData := &domain.Pemupukan{
		IDPemupukan: "p1",
		NamaPupuk:   "Organik Cair",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].NamaPupuk != "Organik Cair" {
		t.Errorf("expected updated name 'Organik Cair', got '%s'", repo.items[0].NamaPupuk)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPemupukanRepo{
		items: []*domain.Pemupukan{
			{IDPemupukan: "p1"},
		},
	}
	uc := usecase.NewPemupukanUsecase(repo, nil)

	err := uc.Delete(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
