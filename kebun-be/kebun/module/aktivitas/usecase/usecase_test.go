package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/aktivitas/domain"
	"github.com/farmease/kebun-be/kebun/module/aktivitas/usecase"
)

type mockAktivitasRepo struct {
	items    []domain.Aktivitas
	storeErr error
	findErr  error
}

func (m *mockAktivitasRepo) FindAll(ctx context.Context) ([]domain.Aktivitas, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockAktivitasRepo) FindByID(ctx context.Context, id string) (*domain.Aktivitas, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, a := range m.items {
		if a.IDAktivitas == id {
			return &a, nil
		}
	}
	return nil, nil
}

func (m *mockAktivitasRepo) Store(ctx context.Context, a *domain.Aktivitas) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	a.IDAktivitas = "test-aktivitas-uuid"
	m.items = append(m.items, *a)
	return nil
}

func (m *mockAktivitasRepo) Update(ctx context.Context, a *domain.Aktivitas) error {
	for i, existing := range m.items {
		if existing.IDAktivitas == a.IDAktivitas {
			m.items[i] = *a
			return nil
		}
	}
	return nil
}

func (m *mockAktivitasRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.IDAktivitas == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockAktivitasRepo{
		items: []domain.Aktivitas{
			{IDAktivitas: "a1", NamaJenisAktivitas: "Penyiraman"},
			{IDAktivitas: "a2", NamaJenisAktivitas: "Pemupukan"},
		},
	}
	uc := usecase.NewAktivitasUsecase(repo)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockAktivitasRepo{
		items: []domain.Aktivitas{
			{IDAktivitas: "a1", NamaJenisAktivitas: "Penyiraman"},
		},
	}
	uc := usecase.NewAktivitasUsecase(repo)

	res, err := uc.FindByID(context.Background(), "a1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDAktivitas != "a1" {
		t.Errorf("expected ID 'a1', got '%s'", res.IDAktivitas)
	}
}

func TestCreate_Success(t *testing.T) {
	repo := &mockAktivitasRepo{}
	uc := usecase.NewAktivitasUsecase(repo)

	newAct := &domain.Aktivitas{
		NamaJenisAktivitas:   "Penyiraman",
		NamaRincianAktivitas: "Penyiraman pagi",
		LahanIDLahan:         "lahan-1",
	}

	err := uc.Create(context.Background(), newAct)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item stored, got %d", len(repo.items))
	}

	if repo.items[0].IDAktivitas != "test-aktivitas-uuid" {
		t.Errorf("expected generated ID 'test-aktivitas-uuid', got '%s'", repo.items[0].IDAktivitas)
	}
}

func TestCreate_Error(t *testing.T) {
	expectedErr := errors.New("store failure")
	repo := &mockAktivitasRepo{storeErr: expectedErr}
	uc := usecase.NewAktivitasUsecase(repo)

	newAct := &domain.Aktivitas{
		NamaJenisAktivitas: "Penyiraman",
	}

	err := uc.Create(context.Background(), newAct)
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestUpdate_Success(t *testing.T) {
	repo := &mockAktivitasRepo{
		items: []domain.Aktivitas{
			{IDAktivitas: "a1", NamaJenisAktivitas: "Penyiraman"},
		},
	}
	uc := usecase.NewAktivitasUsecase(repo)

	updateData := &domain.Aktivitas{
		IDAktivitas:        "a1",
		NamaJenisAktivitas: "Penyiraman Sore",
	}

	err := uc.Update(context.Background(), updateData)
	if err != nil {
		t.Fatalf("unexpected error updating: %v", err)
	}

	if repo.items[0].NamaJenisAktivitas != "Penyiraman Sore" {
		t.Errorf("expected updated name to be 'Penyiraman Sore', got '%s'", repo.items[0].NamaJenisAktivitas)
	}
}

func TestDelete_Success(t *testing.T) {
	repo := &mockAktivitasRepo{
		items: []domain.Aktivitas{
			{IDAktivitas: "a1"},
		},
	}
	uc := usecase.NewAktivitasUsecase(repo)

	err := uc.Delete(context.Background(), "a1")
	if err != nil {
		t.Fatalf("unexpected error deleting: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
