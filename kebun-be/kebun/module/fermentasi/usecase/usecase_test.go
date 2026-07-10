package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/fermentasi/domain"
	"github.com/farmease/kebun-be/kebun/module/fermentasi/usecase"
)

type mockFermentasiRepo struct {
	items        []*domain.Fermentasi
	logs         []*domain.LogFermentasi
	storeErr     error
	updateErr    error
	storeLogErr  error
	findErr      error
}

func (m *mockFermentasiRepo) FindAll(ctx context.Context) ([]*domain.Fermentasi, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func (m *mockFermentasiRepo) FindByID(ctx context.Context, id string) (*domain.Fermentasi, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, f := range m.items {
		if f.IDFermentasi == id {
			return f, nil
		}
	}
	return nil, nil
}

func (m *mockFermentasiRepo) Store(ctx context.Context, f *domain.Fermentasi) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	f.IDFermentasi = "test-fermentasi-uuid"
	m.items = append(m.items, f)
	return nil
}

func (m *mockFermentasiRepo) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	for _, f := range m.items {
		if f.IDFermentasi == id {
			f.Status = status
			f.Notes = notes
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockFermentasiRepo) FindLogsByFermentasiID(ctx context.Context, fermentasiID string) ([]*domain.LogFermentasi, error) {
	var matched []*domain.LogFermentasi
	for _, l := range m.logs {
		if l.IDFermentasi == fermentasiID {
			matched = append(matched, l)
		}
	}
	return matched, nil
}

func (m *mockFermentasiRepo) StoreLog(ctx context.Context, l *domain.LogFermentasi) error {
	if m.storeLogErr != nil {
		return m.storeLogErr
	}
	l.IDLog = "test-log-uuid"
	m.logs = append(m.logs, l)
	return nil
}

func TestFindAll_Success(t *testing.T) {
	repo := &mockFermentasiRepo{
		items: []*domain.Fermentasi{
			{IDFermentasi: "f1", Status: "proses"},
			{IDFermentasi: "f2", Status: "siap"},
		},
	}
	uc := usecase.NewFermentasiUsecase(repo, nil)

	res, err := uc.FindAll(context.Background())
	if err != nil {
		t.Fatalf("unexpected error finding all: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 items, got %d", len(res))
	}
}

func TestFindByID_Success(t *testing.T) {
	repo := &mockFermentasiRepo{
		items: []*domain.Fermentasi{
			{IDFermentasi: "f1", Status: "proses"},
		},
	}
	uc := usecase.NewFermentasiUsecase(repo, nil)

	res, err := uc.FindByID(context.Background(), "f1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}

	if res.IDFermentasi != "f1" {
		t.Errorf("expected ID 'f1', got '%s'", res.IDFermentasi)
	}
}

func TestCreatePupukFermentasi_Success(t *testing.T) {
	repo := &mockFermentasiRepo{}
	uc := usecase.NewFermentasiUsecase(repo, nil)

	newFermentasi := &domain.Fermentasi{
		Notes: "Fermentasi baru",
	}

	err := uc.CreatePupukFermentasi(context.Background(), newFermentasi)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 item stored, got %d", len(repo.items))
	}

	if repo.items[0].Status != "proses" {
		t.Errorf("expected status 'proses', got '%s'", repo.items[0].Status)
	}
}

func TestUpdateStatus_Success(t *testing.T) {
	repo := &mockFermentasiRepo{
		items: []*domain.Fermentasi{
			{IDFermentasi: "f1", Status: "proses"},
		},
	}
	uc := usecase.NewFermentasiUsecase(repo, nil)

	err := uc.UpdateStatus(context.Background(), "f1", "siap", "sudah selesai")
	if err != nil {
		t.Fatalf("unexpected error updating: %v", err)
	}

	if repo.items[0].Status != "siap" {
		t.Errorf("expected status 'siap', got '%s'", repo.items[0].Status)
	}
	if repo.items[0].Notes != "sudah selesai" {
		t.Errorf("expected notes 'sudah selesai', got '%s'", repo.items[0].Notes)
	}
}

func TestAddLog_Success(t *testing.T) {
	repo := &mockFermentasiRepo{}
	uc := usecase.NewFermentasiUsecase(repo, nil)

	newLog := &domain.LogFermentasi{
		IDFermentasi: "f1",
		Notes:        "suhu normal",
	}

	err := uc.AddLog(context.Background(), newLog)
	if err != nil {
		t.Fatalf("unexpected error adding log: %v", err)
	}

	if len(repo.logs) != 1 {
		t.Errorf("expected 1 log stored, got %d", len(repo.logs))
	}

	if repo.logs[0].IDLog != "test-log-uuid" {
		t.Errorf("expected log ID 'test-log-uuid', got '%s'", repo.logs[0].IDLog)
	}
}
