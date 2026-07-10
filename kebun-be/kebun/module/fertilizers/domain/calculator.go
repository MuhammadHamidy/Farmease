package domain

import "math"

// ============================================================
// KONSTANTA DOSIS PUPUK ORGANIK/KANDANG
// ============================================================

// --- ALPUKAT (Persea americana) ---

type AlpukatDosis struct {
	LubangTanamMin     float64 // kg/pohon, saat tanam (sekali)
	LubangTanamMax     float64
	VegetatifBibitMin  float64 // kg/pohon, usia < 1 tahun
	VegetatifBibitMax  float64
	VegetatifMudaMin   float64 // kg/pohon, usia 1-3 tahun
	VegetatifMudaMax   float64
	VegetatifDewasaMin float64 // kg/pohon, usia 3-6 tahun
	VegetatifDewasaMax float64
	GeneratifMin       float64 // kg/pohon, usia > 3 tahun produktif
	GeneratifMax       float64
	FrekuensiVegetatif int     // kali per tahun
	FrekuensiGeneratif int     // kali per tahun
}

var DefaultAlpukatDosis = AlpukatDosis{
	LubangTanamMin:     20,
	LubangTanamMax:     30,
	VegetatifBibitMin:  1.5,
	VegetatifBibitMax:  2.0,
	VegetatifMudaMin:   2.0,
	VegetatifMudaMax:   10.0,
	VegetatifDewasaMin: 10.0,
	VegetatifDewasaMax: 20.0,
	GeneratifMin:       10.0, // Disesuaikan dengan Tabel 2.2 (10-20 kg)
	GeneratifMax:       20.0, // Disesuaikan dengan Tabel 2.2 (10-20 kg)
	FrekuensiVegetatif: 2,
	FrekuensiGeneratif: 3,    // Disesuaikan dengan Tabel 2.2 (3 kali/tahun)
}

// --- KELENGKENG (Dimocarpus longan) ---

type KelengkengDosis struct {
	VegetatifMudaMin    float64 // kg/pohon, usia < 3 tahun
	VegetatifMudaMax    float64
	VegetatifDewasaMin  float64 // kg/pohon, usia 3-7 tahun
	VegetatifDewasaMax  float64
	GeneratifPraBungaKg float64 // kg/pohon, fase pra-bunga
	GeneratifBuahKg     float64 // kg/pohon, fase pembesaran buah
	FrekuensiVegetatif  int     // kali per tahun
	FrekuensiGeneratif  int     // kali per tahun
}

var DefaultKelengkengDosis = KelengkengDosis{
	VegetatifMudaMin:    5.0,
	VegetatifMudaMax:    10.0,
	VegetatifDewasaMin:  10.0,
	VegetatifDewasaMax:  20.0,
	GeneratifPraBungaKg: 20.0,
	GeneratifBuahKg:     25.0,
	FrekuensiVegetatif:  2,
	FrekuensiGeneratif:  2,
}

// ============================================================
// TIPE DATA INPUT
// ============================================================

type FasePohon string

const (
	FaseVegetatif         FasePohon = "vegetatif"
	FaseGeneratifPraBunga FasePohon = "generatif_pra_bunga"
	FaseGeneratifBuah     FasePohon = "generatif_buah"
	FaseGeneratif         FasePohon = "generatif"
)

type JenisTanaman string

const (
	TanamanAlpukat    JenisTanaman = "alpukat"
	TanamanKelengkeng JenisTanaman = "kelengkeng"
)

type DataPohon struct {
	ID        string       
	Jenis     JenisTanaman 
	Fase      FasePohon    
	UsiaTahun float64      
	Varietas  string       
}

type HasilHitungPohon struct {
	PohonID           string
	Jenis             JenisTanaman
	Fase              FasePohon
	UsiaTahun         float64
	DosisPerAplikasi  float64
	FrekuensiPerTahun int
	TotalPerTahun     float64
	Keterangan        string
}

type HasilHitungKebun struct {
	DetailPohon            []HasilHitungPohon
	TotalKebutuhanKgTahun  float64
	TotalKebutuhanKgSiklus float64
	StokTersediaKg         float64
	StokAmanKg             float64
	Cukup                  bool
	KekuranganKg           float64
	SafetyFactor           float64
}

// ============================================================
// RUMUS INTI — ALPUKAT
// ============================================================

func HitungDosisAlpukat(fase FasePohon, usiaTahun float64, d AlpukatDosis) (dosis float64, frekuensi int, keterangan string) {
	switch fase {
	case FaseVegetatif:
		frekuensi = d.FrekuensiVegetatif
		if usiaTahun < 1.0 {
			dosis = d.VegetatifBibitMax
			keterangan = "Vegetatif bibit (< 1 tahun)"
		} else if usiaTahun < 3.0 {
			rasio := (usiaTahun - 1.0) / (3.0 - 1.0)
			dosis = d.VegetatifMudaMin + rasio*(d.VegetatifMudaMax-d.VegetatifMudaMin)
			keterangan = "Vegetatif muda (1–3 tahun)"
		} else if usiaTahun < 6.0 {
			rasio := (usiaTahun - 3.0) / (6.0 - 3.0)
			dosis = d.VegetatifDewasaMin + rasio*(d.VegetatifDewasaMax-d.VegetatifDewasaMin)
			keterangan = "Vegetatif dewasa (3–6 tahun)"
		} else {
			dosis = d.VegetatifDewasaMax
			keterangan = "Vegetatif pohon tua (≥ 6 tahun)"
		}
	case FaseGeneratif, FaseGeneratifBuah:
		frekuensi = d.FrekuensiGeneratif
		dosis = (d.GeneratifMin + d.GeneratifMax) / 2.0
		keterangan = "Generatif produktif (pasca panen)"
	default:
		dosis = 0
		frekuensi = 0
		keterangan = "Fase tidak dikenali"
	}

	dosis = math.Round(dosis*100) / 100
	return
}

// ============================================================
// RUMUS INTI — KELENGKENG
// ============================================================

func HitungDosisKelengkeng(fase FasePohon, usiaTahun float64, d KelengkengDosis) (dosis float64, frekuensi int, keterangan string) {
	switch fase {
	case FaseVegetatif:
		frekuensi = d.FrekuensiVegetatif
		if usiaTahun < 3.0 {
			rasio := usiaTahun / 3.0
			dosis = d.VegetatifMudaMin + rasio*(d.VegetatifMudaMax-d.VegetatifMudaMin)
			keterangan = "Vegetatif muda (< 3 tahun)"
		} else if usiaTahun < 7.0 {
			rasio := (usiaTahun - 3.0) / (7.0 - 3.0)
			dosis = d.VegetatifDewasaMin + rasio*(d.VegetatifDewasaMax-d.VegetatifDewasaMin)
			keterangan = "Vegetatif dewasa (3–7 tahun)"
		} else {
			dosis = d.VegetatifDewasaMax
			keterangan = "Vegetatif pohon tua (≥ 7 tahun)"
		}
	case FaseGeneratifPraBunga:
		frekuensi = d.FrekuensiGeneratif
		dosis = d.GeneratifPraBungaKg
		keterangan = "Generatif pra-bunga"
	case FaseGeneratifBuah, FaseGeneratif:
		frekuensi = d.FrekuensiGeneratif
		dosis = d.GeneratifBuahKg
		keterangan = "Generatif pembesaran buah"
	default:
		dosis = 0
		frekuensi = 0
		keterangan = "Fase tidak dikenali"
	}

	dosis = math.Round(dosis*100) / 100
	return
}

// ============================================================
// FUNGSI AGREGAT
// ============================================================

func HitungPerPohon(pohon DataPohon) HasilHitungPohon {
	var dosis float64
	var frekuensi int
	var keterangan string

	switch pohon.Jenis {
	case TanamanAlpukat:
		dosis, frekuensi, keterangan = HitungDosisAlpukat(pohon.Fase, pohon.UsiaTahun, DefaultAlpukatDosis)
	case TanamanKelengkeng:
		dosis, frekuensi, keterangan = HitungDosisKelengkeng(pohon.Fase, pohon.UsiaTahun, DefaultKelengkengDosis)
	}

	totalPerTahun := math.Round(dosis*float64(frekuensi)*100) / 100

	return HasilHitungPohon{
		PohonID:           pohon.ID,
		Jenis:             pohon.Jenis,
		Fase:              pohon.Fase,
		UsiaTahun:         pohon.UsiaTahun,
		DosisPerAplikasi:  dosis,
		FrekuensiPerTahun: frekuensi,
		TotalPerTahun:     totalPerTahun,
		Keterangan:        keterangan,
	}
}

func HitungKebutuhanKebun(daftarPohon []DataPohon, stokTersediaKg float64, safetyFactor float64) HasilHitungKebun {
	if safetyFactor <= 0 {
		safetyFactor = 1.0
	}

	var detail []HasilHitungPohon
	var totalTahun float64

	for _, pohon := range daftarPohon {
		hasil := HitungPerPohon(pohon)
		detail = append(detail, hasil)
		totalTahun += hasil.TotalPerTahun
	}

	totalSiklus := math.Round((totalTahun/2)*100) / 100
	stokAman := math.Round(totalSiklus*safetyFactor*100) / 100
	kekurangan := math.Max(0, stokAman-stokTersediaKg)
	kekurangan = math.Round(kekurangan*100) / 100

	return HasilHitungKebun{
		DetailPohon:            detail,
		TotalKebutuhanKgTahun:  math.Round(totalTahun*100) / 100,
		TotalKebutuhanKgSiklus: totalSiklus,
		StokTersediaKg:         stokTersediaKg,
		StokAmanKg:             stokAman,
		Cukup:                  stokTersediaKg >= stokAman,
		KekuranganKg:           kekurangan,
		SafetyFactor:           safetyFactor,
	}
}

type KonfigurasiProduksiKohe struct {
	JumlahKarungPerBulan int
	BeratPerKarungKg     float64
}

var DefaultKonfigProduksi = KonfigurasiProduksiKohe{
	JumlahKarungPerBulan: 15,
	BeratPerKarungKg:     50,
}

func HitungProduksiKohe(bulan int, k KonfigurasiProduksiKohe) float64 {
	return float64(k.JumlahKarungPerBulan) * k.BeratPerKarungKg * float64(bulan)
}

type HasilRekomendasiLengkap struct {
	Kebun                HasilHitungKebun `json:"kebun"`
	ProduksiKoheSiklusKg float64          `json:"produksi_kohe_siklus_kg"`
	ProduksiKoheBulanKg  float64          `json:"produksi_kohe_bulan_kg"`
	StatusStok           string           `json:"status_stok"`
	SurplusKg            float64          `json:"surplus_kg"`
	KekuranganKg         float64          `json:"kekurangan_kg"`
	Rekomendasi          string           `json:"rekomendasi"`
}

func HitungRekomendasiLengkap(daftarPohon []DataPohon, konfigKohe KonfigurasiProduksiKohe, safetyFactor float64) HasilRekomendasiLengkap {
	produksiSiklus := HitungProduksiKohe(6, konfigKohe)
	produksiBulan := HitungProduksiKohe(1, konfigKohe)

	kebun := HitungKebutuhanKebun(daftarPohon, produksiSiklus, safetyFactor)

	var statusStok string
	var surplusKg, kekuranganKg float64
	var rekomendasi string

	selisih := produksiSiklus - kebun.StokAmanKg

	switch {
	case selisih > 0:
		statusStok = "LEBIH"
		surplusKg = math.Round(selisih*100) / 100
		rekomendasi = "Stok pupuk kandang mencukupi kebutuhan semua pohon. Sisa stok dapat disimpan untuk siklus berikutnya atau digunakan sebagai mulsa."
	case selisih == 0:
		statusStok = "CUKUP"
		rekomendasi = "Stok pupuk kandang tepat mencukupi kebutuhan semua pohon tanpa cadangan."
	default:
		statusStok = "KURANG"
		kekuranganKg = math.Round(math.Abs(selisih)*100) / 100
		rekomendasi = "Stok pupuk kandang tidak mencukupi. Dibutuhkan tambahan dari luar farm atau penjadwalan ulang pemupukan bertahap."
	}

	return HasilRekomendasiLengkap{
		Kebun:                kebun,
		ProduksiKoheSiklusKg: produksiSiklus,
		ProduksiKoheBulanKg:  produksiBulan,
		StatusStok:           statusStok,
		SurplusKg:            surplusKg,
		KekuranganKg:         kekuranganKg,
		Rekomendasi:          rekomendasi,
	}
}
