package usecase_test

import (
	"context"
	"testing"

	"github.com/farmease/kebun-be/kebun/module/pencatatan_types/domain"
	"github.com/farmease/kebun-be/kebun/module/pencatatan_types/usecase"
)

type mockTypesRepo struct {
	jenisList   []domain.JenisPencatatan
	rincianList []domain.RincianPencatatan
	findErr     error
	storeErr    error
}

func (m *mockTypesRepo) FindAllJenis(ctx context.Context) ([]domain.JenisPencatatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.jenisList, nil
}

func (m *mockTypesRepo) FindAllRincian(ctx context.Context) ([]domain.RincianPencatatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.rincianList, nil
}

func (m *mockTypesRepo) FindRincianByJenisID(ctx context.Context, jenisID string) ([]domain.RincianPencatatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	var matched []domain.RincianPencatatan
	for _, r := range m.rincianList {
		if r.JenisID == jenisID {
			matched = append(matched, r)
		}
	}
	return matched, nil
}

func (m *mockTypesRepo) FindJenisByNama(ctx context.Context, nama string) (*domain.JenisPencatatan, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, j := range m.jenisList {
		if j.Nama == nama {
			return &j, nil
		}
	}
	return nil, nil
}

func (m *mockTypesRepo) StoreJenis(ctx context.Context, j *domain.JenisPencatatan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	j.IDJenis = "test-jenis-uuid"
	m.jenisList = append(m.jenisList, *j)
	return nil
}

func (m *mockTypesRepo) StoreRincian(ctx context.Context, r *domain.RincianPencatatan) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	r.IDRincian = "test-rincian-uuid"
	m.rincianList = append(m.rincianList, *r)
	return nil
}

func TestGetCatalog_Success(t *testing.T) {
	repo := &mockTypesRepo{
		jenisList: []domain.JenisPencatatan{
			{IDJenis: "j1", Nama: "Pengolahan Pupuk"},
		},
		rincianList: []domain.RincianPencatatan{
			{IDRincian: "r1", JenisNama: "Pengolahan Pupuk", Nama: "Fermentasi"},
		},
	}
	uc := usecase.NewUsecase(repo)

	cat, err := uc.GetCatalog(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(cat.Jenis) != 1 {
		t.Errorf("expected 1 jenis, got %d", len(cat.Jenis))
	}

	if len(cat.RincianByJenis["Pengolahan Pupuk"]) != 1 {
		t.Errorf("expected 1 rincian for 'Pengolahan Pupuk'")
	}
}

func TestGetRincianByJenisNama_Success(t *testing.T) {
	repo := &mockTypesRepo{
		jenisList: []domain.JenisPencatatan{
			{IDJenis: "j1", Nama: "Pengolahan Pupuk"},
		},
		rincianList: []domain.RincianPencatatan{
			{IDRincian: "r1", JenisID: "j1", Nama: "Fermentasi"},
		},
	}
	uc := usecase.NewUsecase(repo)

	res, err := uc.GetRincianByJenisNama(context.Background(), "Pengolahan Pupuk")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 rincian, got %d", len(res))
	}
}

func TestCreateJenis_Success(t *testing.T) {
	repo := &mockTypesRepo{}
	uc := usecase.NewUsecase(repo)

	order := 5
	j, err := uc.CreateJenis(context.Background(), domain.CreateJenisInput{
		Nama:      "Aktivitas Baru",
		SortOrder: &order,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if j.Nama != "Aktivitas Baru" {
		t.Errorf("expected name 'Aktivitas Baru', got '%s'", j.Nama)
	}
	if j.SortOrder != 5 {
		t.Errorf("expected order 5, got %d", j.SortOrder)
	}
}

func TestCreateJenis_EmptyName(t *testing.T) {
	repo := &mockTypesRepo{}
	uc := usecase.NewUsecase(repo)

	_, err := uc.CreateJenis(context.Background(), domain.CreateJenisInput{Nama: ""})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestCreateRincian_Success(t *testing.T) {
	repo := &mockTypesRepo{
		jenisList: []domain.JenisPencatatan{
			{IDJenis: "j1", Nama: "Pupuk"},
		},
	}
	uc := usecase.NewUsecase(repo)

	r, err := uc.CreateRincian(context.Background(), domain.CreateRincianInput{
		JenisNama: "Pupuk",
		Nama:      "Rincian Baru",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if r.Nama != "Rincian Baru" {
		t.Errorf("expected 'Rincian Baru', got '%s'", r.Nama)
	}
}
