package usecase_test

import (
	"context"
	"errors"
	"testing"
	"time"

	fertilizerDomain "github.com/farmease/kebun-be/kebun/module/fertilizers/domain"
	"github.com/farmease/kebun-be/kebun/module/fertilizers/usecase"
	pohonDomain "github.com/farmease/kebun-be/kebun/module/pohon/domain"
)

type mockPohonRepo struct {
	pohonDomain.PohonRepository
	items   []pohonDomain.PohonDetail
	findErr error
}

func (m *mockPohonRepo) FindAllWithDetail(ctx context.Context) ([]pohonDomain.PohonDetail, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	return m.items, nil
}

func TestGetFertilizerRecommendation_Success(t *testing.T) {
	// Let's create two trees: one alpukat, one kelengkeng
	nowStr := time.Now().AddDate(-3, 0, 0).Format("2006-01-02") // 3 years ago
	repo := &mockPohonRepo{
		items: []pohonDomain.PohonDetail{
			{
				Pohon: pohonDomain.Pohon{
					KodePohon:    "P01",
					TanggalTanam: nowStr,
					FasePohon:    "vegetatif",
					Varietas:     "Aligator",
				},
				JenisTanaman: "Alpukat",
			},
			{
				Pohon: pohonDomain.Pohon{
					KodePohon:    "P02",
					TanggalTanam: nowStr,
					FasePohon:    "generatif",
					Varietas:     "New Kristal",
				},
				JenisTanaman: "Kelengkeng",
			},
		},
	}
	uc := usecase.NewUseCase(repo)

	res, err := uc.GetFertilizerRecommendation(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res == nil {
		t.Fatal("expected non-nil recommendation result")
	}

	var alpukatCount, kelengkengCount int
	for _, p := range res.Kebun.DetailPohon {
		if p.Jenis == fertilizerDomain.TanamanAlpukat {
			alpukatCount++
		} else if p.Jenis == fertilizerDomain.TanamanKelengkeng {
			kelengkengCount++
		}
	}

	if alpukatCount != 1 {
		t.Errorf("expected 1 avocado tree, got %d", alpukatCount)
	}

	if kelengkengCount != 1 {
		t.Errorf("expected 1 longan tree, got %d", kelengkengCount)
	}
}

func TestGetFertilizerRecommendation_Error(t *testing.T) {
	expectedErr := errors.New("repository error")
	repo := &mockPohonRepo{findErr: expectedErr}
	uc := usecase.NewUseCase(repo)

	_, err := uc.GetFertilizerRecommendation(context.Background())
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
