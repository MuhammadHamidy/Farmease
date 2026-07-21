package domain_test

import (
	"testing"

	"github.com/farmease/kebun-be/kebun/module/fertilizers/domain"
)

func TestHitungPupukTunggal(t *testing.T) {
	hara := domain.DefaultKebutuhanHaraAlpukatGeneratif
	urea, sp36, kcl := domain.HitungPupukTunggal(hara)

	// nRata = (1020 + 1630) / 2 = 1325
	// Urea = 1325 / 0.46 = 2880.43
	expectedUrea := 2880.43
	if urea != expectedUrea {
		t.Errorf("expected Urea %f, got %f", expectedUrea, urea)
	}

	// pRata = (1150 + 1250) / 2 = 1200
	// SP36 = 1200 / 0.36 = 3333.33
	expectedSP36 := 3333.33
	if sp36 != expectedSP36 {
		t.Errorf("expected SP36 %f, got %f", expectedSP36, sp36)
	}

	// kRata = (2400 + 2500) / 2 = 2450
	// KCl = 2450 / 0.60 = 4083.33
	expectedKCl := 4083.33
	if kcl != expectedKCl {
		t.Errorf("expected KCl %f, got %f", expectedKCl, kcl)
	}
}

func TestHitungDosisPupuk(t *testing.T) {
	// 1. Organik Padat
	resPadat := domain.HitungDosisPupuk(domain.PupukOrganikPadat, domain.TanamanAlpukat, domain.FaseGeneratif, 4.0)
	if resPadat.Kategori != domain.PupukOrganikPadat || resPadat.Satuan != "kg" || resPadat.Dosis <= 0 {
		t.Errorf("unexpected Organik Padat result: %+v", resPadat)
	}

	// 2. Organik Cair
	resCair := domain.HitungDosisPupuk(domain.PupukOrganikCair, domain.TanamanAlpukat, domain.FaseGeneratif, 4.0)
	if resCair.Kategori != domain.PupukOrganikCair || resCair.DisclaimerCair == "" || resCair.VolumePOCMurniL <= 0 {
		t.Errorf("unexpected Organik Cair result: %+v", resCair)
	}

	// 3. Kimia
	resKimia := domain.HitungDosisPupuk(domain.PupukKimia, domain.TanamanAlpukat, domain.FaseGeneratif, 4.0)
	if resKimia.Kategori != domain.PupukKimia || resKimia.UreaGram <= 0 || resKimia.SP36Gram <= 0 || resKimia.KClGram <= 0 {
		t.Errorf("unexpected Kimia result: %+v", resKimia)
	}
}

func TestHitungDosisPOC(t *testing.T) {
	dp := domain.DataPohonPOC{
		ID:          "tree-01",
		Jenis:       domain.TanamanAlpukat,
		Varietas:    "Alpukat Aligator",
		StatusUsia:  domain.UsiaProduktif,
		Fase:        domain.FaseGeneratif,
		JumlahPohon: 10,
	}

	res := domain.HitungDosisPOC(dp, domain.DefaultVolumeLarutan, domain.DefaultKonfigPOC)

	// volPerPohon = 8.0 L
	// totalLarutan = 80 L
	// volumePOCMurni = 0.8 L
	if res.VolumeLarutanPerPohonL != 8.0 {
		t.Errorf("expected volume larutan per pohon 8.0, got %f", res.VolumeLarutanPerPohonL)
	}
	if res.TotalVolumeLarutanL != 80.0 {
		t.Errorf("expected total volume larutan 80.0, got %f", res.TotalVolumeLarutanL)
	}
	if res.VolumePOCMurniL != 0.8 {
		t.Errorf("expected volume POC murni 0.8, got %f", res.VolumePOCMurniL)
	}
	if res.FrekuensiPerBulan != 3.0 {
		t.Errorf("expected frekuensi per bulan 3.0, got %f", res.FrekuensiPerBulan)
	}
}
