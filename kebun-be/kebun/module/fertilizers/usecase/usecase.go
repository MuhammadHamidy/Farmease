package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/module/fertilizers/domain"
	pohonDomain "github.com/farmease/kebun-be/kebun/module/pohon/domain"
)

type useCase struct {
	pohonRepo pohonDomain.PohonRepository
}

func NewUseCase(pohonRepo pohonDomain.PohonRepository) domain.UseCase {
	return &useCase{pohonRepo: pohonRepo}
}

func (u *useCase) GetFertilizerRecommendation(ctx context.Context) (*domain.HasilRekomendasiLengkap, error) {
	// 1. Ambil data pohon beserta detail lahan
	pohonList, err := u.pohonRepo.FindAllWithDetail(ctx)
	if err != nil {
		return nil, err
	}

	// 2. Mapping PohonDetail ke DataPohon
	var dataPohon []domain.DataPohon
	for _, p := range pohonList {
		jenis := mapJenisTanaman(p.JenisTanaman)
		if jenis == "" {
			continue // Skip pohon yang bukan kelengkeng/alpukat
		}

		usia := hitungUsiaTahun(p.TanggalTanam)
		fase := mapFasePohon(p.FasePohon)

		dataPohon = append(dataPohon, domain.DataPohon{
			ID:        p.KodePohon,
			Jenis:     jenis,
			Fase:      fase,
			UsiaTahun: usia,
			Varietas:  p.Varietas,
		})
	}

	// 3. Panggil kalkulator
	// Menggunakan safetyFactor 1.1 (10% cadangan)
	res := domain.HitungRekomendasiLengkap(dataPohon, domain.DefaultKonfigProduksi, 1.1)

	return &res, nil
}

func mapJenisTanaman(jenis string) domain.JenisTanaman {
	j := strings.ToLower(jenis)
	if strings.Contains(j, "alpukat") {
		return domain.TanamanAlpukat
	}
	if strings.Contains(j, "kelengkeng") {
		return domain.TanamanKelengkeng
	}
	return ""
}

func mapFasePohon(fase string) domain.FasePohon {
	f := strings.ToLower(fase)
	switch f {
	case "vegetatif":
		return domain.FaseVegetatif
	case "generatif":
		return domain.FaseGeneratif
	case "generatif pra-bunga", "generatif_pra_bunga", "pra-bunga":
		return domain.FaseGeneratifPraBunga
	case "generatif pembesaran buah", "generatif_buah", "pembesaran buah", "buah":
		return domain.FaseGeneratifBuah
	default:
		// Fallback default
		return domain.FaseVegetatif
	}
}

func hitungUsiaTahun(tglTanam string) float64 {
	if tglTanam == "" {
		return 0
	}
	tanam, err := time.Parse("2006-01-02", tglTanam)
	if err != nil {
		return 0
	}
	
	duration := time.Now().Sub(tanam)
	days := duration.Hours() / 24.0
	years := days / 365.25
	
	if years < 0 {
		return 0
	}
	return years
}

