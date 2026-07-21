package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/stok/domain"
	"github.com/farmease/kebun-be/kebun/module/stok/usecase"
)

type mockStokRepo struct {
	bahanItems []*domain.StokBahan
	pupukItems []*domain.StokPupuk
	obatItems  []*domain.StokObat
	storeErr   error
	updateErr  error
	findErr    error
}

func (m *mockStokRepo) FindAllBahan(ctx context.Context) ([]*domain.StokBahan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.bahanItems, nil
}

func (m *mockStokRepo) FindBahanByID(ctx context.Context, id string) (*domain.StokBahan, error) {
	for _, b := range m.bahanItems {
		if b.IDStokBahan == id {
			return b, nil
		}
	}
	return nil, nil
}

func (m *mockStokRepo) StoreBahan(ctx context.Context, s *domain.StokBahan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	s.IDStokBahan = "test-bahan-uuid"
	m.bahanItems = append(m.bahanItems, s)
	return nil
}

func (m *mockStokRepo) UpdateBahanStock(ctx context.Context, id string, amount float64, typeAction string) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	for _, b := range m.bahanItems {
		if b.IDStokBahan == id {
			if typeAction == "add" {
				b.StokTersedia += amount
			} else {
				b.StokTersedia -= amount
			}
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockStokRepo) FindAllPupuk(ctx context.Context) ([]*domain.StokPupuk, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.pupukItems, nil
}

func (m *mockStokRepo) FindPupukByID(ctx context.Context, id string) (*domain.StokPupuk, error) {
	for _, p := range m.pupukItems {
		if p.IDStokPupuk == id {
			return p, nil
		}
	}
	return nil, nil
}

func (m *mockStokRepo) StorePupuk(ctx context.Context, s *domain.StokPupuk) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	s.IDStokPupuk = "test-pupuk-uuid"
	m.pupukItems = append(m.pupukItems, s)
	return nil
}

func (m *mockStokRepo) UpdatePupukStock(ctx context.Context, id string, amount float64, typeAction string) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	for _, p := range m.pupukItems {
		if p.IDStokPupuk == id {
			if typeAction == "add" {
				p.StokTersedia += amount
			} else {
				p.StokTersedia -= amount
			}
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockStokRepo) FindAllObat(ctx context.Context) ([]*domain.StokObat, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.obatItems, nil
}

func (m *mockStokRepo) FindObatByID(ctx context.Context, id string) (*domain.StokObat, error) {
	for _, o := range m.obatItems {
		if o.IDStokObat == id {
			return o, nil
		}
	}
	return nil, nil
}

func (m *mockStokRepo) StoreObat(ctx context.Context, s *domain.StokObat) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	s.IDStokObat = "test-obat-uuid"
	m.obatItems = append(m.obatItems, s)
	return nil
}

func (m *mockStokRepo) UpdateObatStock(ctx context.Context, id string, amount float64, typeAction string) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	for _, o := range m.obatItems {
		if o.IDStokObat == id {
			if typeAction == "add" {
				o.StokTersedia += amount
			} else {
				o.StokTersedia -= amount
			}
			return nil
		}
	}
	return errors.New("not found")
}

func TestFindAllBahan_Success(t *testing.T) {
	repo := &mockStokRepo{
		bahanItems: []*domain.StokBahan{
			{IDStokBahan: "b1", NamaBahan: "Air", StokTersedia: 1000},
		},
	}
	uc := usecase.NewStokUsecase(repo, nil)

	res, err := uc.FindAllBahan(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 item, got %d", len(res))
	}
}

func TestStoreBahan_Success(t *testing.T) {
	repo := &mockStokRepo{}
	uc := usecase.NewStokUsecase(repo, nil)

	newB := &domain.StokBahan{NamaBahan: "Dekomposer"}
	err := uc.StoreBahan(context.Background(), newB)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.bahanItems[0].IDStokBahan != "test-bahan-uuid" {
		t.Errorf("expected generated uuid, got '%s'", repo.bahanItems[0].IDStokBahan)
	}
}

func TestUpdateBahanStock_Success(t *testing.T) {
	repo := &mockStokRepo{
		bahanItems: []*domain.StokBahan{
			{IDStokBahan: "b1", StokTersedia: 50.0},
		},
	}
	uc := usecase.NewStokUsecase(repo, nil)

	err := uc.UpdateBahanStock(context.Background(), "b1", 10.0, "add")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.bahanItems[0].StokTersedia != 60.0 {
		t.Errorf("expected 60, got %f", repo.bahanItems[0].StokTersedia)
	}
}

func TestFindAllPupuk_Success(t *testing.T) {
	repo := &mockStokRepo{
		pupukItems: []*domain.StokPupuk{
			{IDStokPupuk: "p1", NamaPupuk: "Urea", StokTersedia: 10},
		},
	}
	uc := usecase.NewStokUsecase(repo, nil)

	res, err := uc.FindAllPupuk(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 item, got %d", len(res))
	}
}

func TestStorePupuk_Success(t *testing.T) {
	repo := &mockStokRepo{}
	uc := usecase.NewStokUsecase(repo, nil)

	newP := &domain.StokPupuk{NamaPupuk: "NPK"}
	err := uc.StorePupuk(context.Background(), newP)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.pupukItems[0].IDStokPupuk != "test-pupuk-uuid" {
		t.Errorf("expected generated ID, got '%s'", repo.pupukItems[0].IDStokPupuk)
	}
}

func TestUpdatePupukStock_Success(t *testing.T) {
	repo := &mockStokRepo{
		pupukItems: []*domain.StokPupuk{
			{IDStokPupuk: "p1", StokTersedia: 50.0},
		},
	}
	uc := usecase.NewStokUsecase(repo, nil)

	err := uc.UpdatePupukStock(context.Background(), "p1", 10.0, "sub")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.pupukItems[0].StokTersedia != 40.0 {
		t.Errorf("expected 40, got %f", repo.pupukItems[0].StokTersedia)
	}
}

func TestFindAllObat_Success(t *testing.T) {
	repo := &mockStokRepo{
		obatItems: []*domain.StokObat{
			{IDStokObat: "o1", NamaObat: "Antiseptik", StokTersedia: 5.0},
		},
	}
	uc := usecase.NewStokUsecase(repo, nil)

	res, err := uc.FindAllObat(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 item, got %d", len(res))
	}
}

func TestStoreObat_Success(t *testing.T) {
	repo := &mockStokRepo{}
	uc := usecase.NewStokUsecase(repo, nil)

	newO := &domain.StokObat{NamaObat: "Fungisida"}
	err := uc.StoreObat(context.Background(), newO)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.obatItems[0].IDStokObat != "test-obat-uuid" {
		t.Errorf("expected generated ID, got '%s'", repo.obatItems[0].IDStokObat)
	}
}

func TestUpdateObatStock_Success(t *testing.T) {
	repo := &mockStokRepo{
		obatItems: []*domain.StokObat{
			{IDStokObat: "o1", StokTersedia: 50.0},
		},
	}
	uc := usecase.NewStokUsecase(repo, nil)

	err := uc.UpdateObatStock(context.Background(), "o1", 5.0, "sub")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.obatItems[0].StokTersedia != 45.0 {
		t.Errorf("expected 45, got %f", repo.obatItems[0].StokTersedia)
	}
}
