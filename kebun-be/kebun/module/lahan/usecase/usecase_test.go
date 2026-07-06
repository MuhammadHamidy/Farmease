package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/lahan/domain"
	"github.com/farmease/kebun-be/kebun/module/lahan/usecase"
)

type mockLahanRepo struct {
	lands     []domain.Lahan
	storeErr  error
	byCodeMap map[string]*domain.Lahan
}

func (m *mockLahanRepo) FindAll(ctx context.Context) ([]domain.Lahan, error) {
	return m.lands, nil
}

func (m *mockLahanRepo) FindByID(ctx context.Context, id string) (*domain.Lahan, error) {
	for _, l := range m.lands {
		if l.IDLahan == id {
			return &l, nil
		}
	}
	return nil, nil
}

func (m *mockLahanRepo) FindByKodeLahan(ctx context.Context, kode string) (*domain.Lahan, error) {
	if land, ok := m.byCodeMap[kode]; ok {
		return land, nil
	}
	for _, l := range m.lands {
		if l.KodeLahan == kode {
			return &l, nil
		}
	}
	return nil, nil
}

func (m *mockLahanRepo) Store(ctx context.Context, l *domain.Lahan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	l.IDLahan = "test-land-uuid"
	m.lands = append(m.lands, *l)
	return nil
}

func (m *mockLahanRepo) Update(ctx context.Context, l *domain.Lahan) error {
	for i, existing := range m.lands {
		if existing.IDLahan == l.IDLahan {
			m.lands[i] = *l
			return nil
		}
	}
	return nil
}

func (m *mockLahanRepo) Delete(ctx context.Context, id string) error {
	return nil
}

func TestCreateLahan_Success(t *testing.T) {
	repo := &mockLahanRepo{byCodeMap: make(map[string]*domain.Lahan)}
	uc := usecase.NewLahanUsecase(repo)

	newLahan := &domain.Lahan{
		KodeLahan:    "L003",
		NamaLahan:    "Lahan Alpukat Baru",
		JenisTanaman: "Alpukat",
		StatusLahan:  1,
		LuasLahan:    5.5,
	}

	err := uc.Create(context.Background(), newLahan)
	if err != nil {
		t.Fatalf("unexpected error creating land: %v", err)
	}

	if len(repo.lands) != 1 {
		t.Errorf("expected 1 land stored, got %d", len(repo.lands))
	}
	if repo.lands[0].KodeLahan != "L003" {
		t.Errorf("expected code 'L003', got '%s'", repo.lands[0].KodeLahan)
	}
}

func TestCreateLahan_DuplicateKode(t *testing.T) {
	existingLahan := &domain.Lahan{
		IDLahan:   "existing-uuid",
		KodeLahan: "L003",
	}
	repo := &mockLahanRepo{
		byCodeMap: map[string]*domain.Lahan{"L003": existingLahan},
	}
	uc := usecase.NewLahanUsecase(repo)

	newLahan := &domain.Lahan{
		KodeLahan: "L003",
	}

	err := uc.Create(context.Background(), newLahan)
	if err == nil {
		t.Fatal("expected error due to duplicate kode, got nil")
	}
	if err.Error() != "kode lahan sudah digunakan" {
		t.Errorf("unexpected error message: %v", err)
	}
}
