package usecase_test

import (
	"context"
	"testing"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pohon/domain"
	"github.com/farmease/kebun-be/kebun/module/pohon/usecase"
)

type mockPohonRepo struct {
	trees     []domain.Pohon
	storeErr  error
	byCodeMap map[string]*domain.Pohon
}

func (m *mockPohonRepo) FindAll(ctx context.Context) ([]domain.Pohon, error) {
	return m.trees, nil
}

func (m *mockPohonRepo) FindAllWithDetail(ctx context.Context) ([]domain.PohonDetail, error) {
	var details []domain.PohonDetail
	for _, t := range m.trees {
		details = append(details, domain.PohonDetail{
			Pohon:        t,
			JenisTanaman: "Alpukat",
		})
	}
	return details, nil
}

func (m *mockPohonRepo) FindByID(ctx context.Context, id string) (*domain.Pohon, error) {
	for _, t := range m.trees {
		if t.IDPohon == id {
			return &t, nil
		}
	}
	return nil, nil
}

func (m *mockPohonRepo) FindByKodePohon(ctx context.Context, kode string) (*domain.Pohon, error) {
	if tree, ok := m.byCodeMap[kode]; ok {
		return tree, nil
	}
	for _, t := range m.trees {
		if t.KodePohon == kode {
			return &t, nil
		}
	}
	return nil, nil
}

func (m *mockPohonRepo) Store(ctx context.Context, p *domain.Pohon) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	p.IDPohon = "test-tree-uuid"
	m.trees = append(m.trees, *p)
	return nil
}

func (m *mockPohonRepo) Update(ctx context.Context, p *domain.Pohon) error {
	for i, t := range m.trees {
		if t.IDPohon == p.IDPohon {
			m.trees[i] = *p
			return nil
		}
	}
	return nil
}

func (m *mockPohonRepo) Delete(ctx context.Context, id string) error {
	var remaining []domain.Pohon
	for _, t := range m.trees {
		if t.IDPohon != id {
			remaining = append(remaining, t)
		}
	}
	m.trees = remaining
	return nil
}

func TestCreatePohon_Success(t *testing.T) {
	repo := &mockPohonRepo{byCodeMap: make(map[string]*domain.Pohon)}
	uc := usecase.NewPohonUsecase(repo)

	newTree := &domain.Pohon{
		KodePohon:    "LA012",
		FasePohon:    "Vegetatif",
		Varietas:     "Alpukat Markus",
		TanggalTanam: "2024-05-17T00:00:00Z",
	}

	err := uc.Create(context.Background(), newTree)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.trees) != 1 {
		t.Errorf("expected 1 tree to be stored, got %d", len(repo.trees))
	}
	if repo.trees[0].StatusPohon != "aktif" {
		t.Errorf("expected default status_pohon to be 'aktif', got '%s'", repo.trees[0].StatusPohon)
	}
}

func TestCreatePohon_InvalidPhase(t *testing.T) {
	repo := &mockPohonRepo{byCodeMap: make(map[string]*domain.Pohon)}
	uc := usecase.NewPohonUsecase(repo)

	newTree := &domain.Pohon{
		KodePohon: "LA012",
		FasePohon: "Pembibitan-Salah",
	}

	err := uc.Create(context.Background(), newTree)
	if err == nil {
		t.Fatal("expected error due to invalid phase, got nil")
	}
}

func TestCreatePohon_DuplicateKode(t *testing.T) {
	existingTree := &domain.Pohon{
		IDPohon:   "existing-uuid",
		KodePohon: "LA012",
		FasePohon: "Vegetatif",
	}
	repo := &mockPohonRepo{
		byCodeMap: map[string]*domain.Pohon{"LA012": existingTree},
	}
	uc := usecase.NewPohonUsecase(repo)

	newTree := &domain.Pohon{
		KodePohon: "LA012",
		FasePohon: "Vegetatif",
	}

	err := uc.Create(context.Background(), newTree)
	if err == nil {
		t.Fatal("expected error due to duplicate kode, got nil")
	}
	if err.Error() != "kode pohon sudah digunakan" {
		t.Errorf("unexpected error message: %v", err)
	}
}

func TestUpdatePohon_UnproductiveChangePhaseBlocked(t *testing.T) {
	// Tree age 1 year (planted in currentYear - 1) -> <= 3 years
	plantedYear := time.Now().Year() - 1
	plantedDateStr := string(rune(plantedYear)) // dummy, let's form format YYYY-MM-DD
	plantedDateStr = time.Date(plantedYear, time.May, 17, 0, 0, 0, 0, time.UTC).Format("2006-01-02")

	existingTree := domain.Pohon{
		IDPohon:      "tree-1",
		KodePohon:    "LA002",
		FasePohon:    "Vegetatif",
		TanggalTanam: plantedDateStr + "T00:00:00Z",
	}

	repo := &mockPohonRepo{
		trees:     []domain.Pohon{existingTree},
		byCodeMap: make(map[string]*domain.Pohon),
	}
	uc := usecase.NewPohonUsecase(repo)

	// Try to update phase to Generatif on unproductive tree
	updateTree := &domain.Pohon{
		IDPohon:   "tree-1",
		KodePohon: "LA002",
		FasePohon: "Generatif",
	}

	err := uc.Update(context.Background(), updateTree)
	if err == nil {
		t.Fatal("expected update to fail due to change phase on young tree, got nil")
	}

	expectedSub := "tanaman belum produktif"
	if !containsSub(err.Error(), expectedSub) {
		t.Errorf("expected error containing '%s', got '%v'", expectedSub, err)
	}
}

func containsSub(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
