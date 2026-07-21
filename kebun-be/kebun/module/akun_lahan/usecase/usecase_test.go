package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/akun_lahan/domain"
	"github.com/farmease/kebun-be/kebun/module/akun_lahan/usecase"
)

type mockAkunLahanRepo struct {
	items    []domain.AkunLahan
	storeErr error
	findErr  error
}

func (m *mockAkunLahanRepo) FindAll(ctx context.Context) ([]domain.AkunLahan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockAkunLahanRepo) FindByID(ctx context.Context, id string) (*domain.AkunLahan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, al := range m.items {
		if al.IDAkunLahan == id {
			return &al, nil
		}
	}
	return nil, nil
}

func (m *mockAkunLahanRepo) Store(ctx context.Context, al *domain.AkunLahan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	al.IDAkunLahan = "test-akunlahan-uuid"
	m.items = append(m.items, *al)
	return nil
}

func (m *mockAkunLahanRepo) Update(ctx context.Context, al *domain.AkunLahan) error {
	for i, existing := range m.items {
		if existing.IDAkunLahan == al.IDAkunLahan {
			m.items[i] = *al
			return nil
		}
	}
	return nil
}

func (m *mockAkunLahanRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDAkunLahan == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockAkunLahanRepo{
		items: []domain.AkunLahan{
			{IDAkunLahan: "al1", Status: "aktif"},
			{IDAkunLahan: "al2", Status: "non-aktif"},
		},
	}
	uc := usecase.NewAkunLahanUsecase(repo)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockAkunLahanRepo{
		items: []domain.AkunLahan{
			{IDAkunLahan: "al1", Status: "aktif"},
		},
	}
	uc := usecase.NewAkunLahanUsecase(repo)

	res, err := uc.FindByID(context.Background(), "al1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDAkunLahan != "al1" {
		t.Errorf("expected ID 'al1', got '%s'", res.IDAkunLahan)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockAkunLahanRepo{}
	uc := usecase.NewAkunLahanUsecase(repo)

	newAl := &domain.AkunLahan{
		Status:       "aktif",
		LahanIDLahan: "lahan-uuid",
		AkunIDAkun:   "akun-uuid",
	}

	err := uc.Create(context.Background(), newAl)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item stored, got %d", len(repo.items))
	}

	if repo.items[0].IDAkunLahan != "test-akunlahan-uuid" {
		t.Errorf("expected generated ID 'test-akunlahan-uuid', got '%s'", repo.items[0].IDAkunLahan)
	}
}

func TestCreate_Error(t *testing.T) {
	expectedErr := errors.New("store error")
	repo := &mockAkunLahanRepo{storeErr: expectedErr}
	uc := usecase.NewAkunLahanUsecase(repo)

	newAl := &domain.AkunLahan{
		Status: "aktif",
	}

	err := uc.Create(context.Background(), newAl)
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockAkunLahanRepo{
		items: []domain.AkunLahan{
			{IDAkunLahan: "al1", Status: "aktif"},
		},
	}
	uc := usecase.NewAkunLahanUsecase(repo)

	updateData := &domain.AkunLahan{
		IDAkunLahan: "al1",
		Status:      "non-aktif",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error updating: %v", err)
	}

	if repo.items[0].Status != "non-aktif" {
		t.Errorf("expected status 'non-aktif', got '%s'", repo.items[0].Status)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockAkunLahanRepo{
		items: []domain.AkunLahan{
			{IDAkunLahan: "al1"},
		},
	}
	uc := usecase.NewAkunLahanUsecase(repo)

	err := uc.Delete(context.Background(), "al1")
	if err != nil {
		t.Fatalf("unexpected error deleting: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
