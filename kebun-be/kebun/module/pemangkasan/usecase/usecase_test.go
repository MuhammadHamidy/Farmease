package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/pemangkasan/domain"
	"github.com/farmease/kebun-be/kebun/module/pemangkasan/usecase"
)

type mockPemangkasanRepo struct {
	items    []domain.Pemangkasan
	storeErr error
	findErr  error
}

func (m *mockPemangkasanRepo) FindAll(ctx context.Context) ([]domain.Pemangkasan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockPemangkasanRepo) FindByID(ctx context.Context, id string) (*domain.Pemangkasan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, p := range m.items {
		if p.IDPemangkasan == id {
			return &p, nil
		}
	}
	return nil, nil
}

func (m *mockPemangkasanRepo) Store(ctx context.Context, p *domain.Pemangkasan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPemangkasan = "test-pemangkasan-uuid"
	m.items = append(m.items, *p)
	return nil
}

func (m *mockPemangkasanRepo) Update(ctx context.Context, p *domain.Pemangkasan) error {
	for i, existing := range m.items {
		if existing.IDPemangkasan == p.IDPemangkasan {
			m.items[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPemangkasanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDPemangkasan == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockPemangkasanRepo{
		items: []domain.Pemangkasan{
			{IDPemangkasan: "p1", Jumlah: "10", Satuan: "kg"},
			{IDPemangkasan: "p2", Jumlah: "5", Satuan: "kg"},
		},
	}
	uc := usecase.NewPemangkasanUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockPemangkasanRepo{
		items: []domain.Pemangkasan{
			{IDPemangkasan: "p1", Jumlah: "10", Satuan: "kg"},
		},
	}
	uc := usecase.NewPemangkasanUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDPemangkasan != "p1" {
		t.Errorf("expected ID 'p1', got '%s'", res.IDPemangkasan)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockPemangkasanRepo{}
	uc := usecase.NewPemangkasanUsecase(repo, nil)

	newPemangkasan := &domain.Pemangkasan{
		Jumlah:               "15.5",
		Satuan:               "kg",
		NamaRincianAktivitas: "Pemangkasan kelengkeng",
		Keterangan:           "Keterangan uji",
	}

	err := uc.Create(context.Background(), newPemangkasan)
	if err != nil {
		t.Fatalf("unexpected error creating pruning: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item stored, got %d", len(repo.items))
	}

	if repo.items[0].IDPemangkasan != "test-pemangkasan-uuid" {
		t.Errorf("expected generated ID 'test-pemangkasan-uuid', got '%s'", repo.items[0].IDPemangkasan)
	}
}

func TestCreate_Error(t *testing.T) {
	expectedErr := errors.New("database store failure")
	repo := &mockPemangkasanRepo{storeErr: expectedErr}
	uc := usecase.NewPemangkasanUsecase(repo, nil)

	newPemangkasan := &domain.Pemangkasan{
		Jumlah: "10",
		Satuan: "kg",
	}

	err := uc.Create(context.Background(), newPemangkasan)
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockPemangkasanRepo{
		items: []domain.Pemangkasan{
			{IDPemangkasan: "p1", Jumlah: "10", Satuan: "kg"},
		},
	}
	uc := usecase.NewPemangkasanUsecase(repo, nil)

	updateData := &domain.Pemangkasan{
		IDPemangkasan: "p1",
		Jumlah:        "20",
		Satuan:        "kg",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error updating: %v", err)
	}

	if repo.items[0].Jumlah != "20" {
		t.Errorf("expected updated quantity to be '20', got '%s'", repo.items[0].Jumlah)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockPemangkasanRepo{
		items: []domain.Pemangkasan{
			{IDPemangkasan: "p1"},
		},
	}
	uc := usecase.NewPemangkasanUsecase(repo, nil)

	err := uc.Delete(context.Background(), "p1")
	if err != nil {
		t.Fatalf("unexpected error deleting: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected repo to be empty, got %d items", len(repo.items))
	}
}
