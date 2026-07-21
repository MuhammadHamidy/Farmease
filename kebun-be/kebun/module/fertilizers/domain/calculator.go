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
// TIPE DATA INPUT & KATEGORI PUPUK
// ============================================================

type KategoriPupuk string

const (
	PupukOrganikPadat KategoriPupuk = "organik_padat" // kg
	PupukOrganikCair  KategoriPupuk = "organik_cair"  // ml/L (disclaimer)
	PupukKimia        KategoriPupuk = "kimia"         // gram (Urea, SP-36, KCl)
)

type KebutuhanHaraAlpukat struct {
	NMinGram     float64 // 1020
	NMaxGram     float64 // 1630
	P2O5MinGram  float64 // 1150
	P2O5MaxGram  float64 // 1250
	K2OMinGram   float64 // 2400
	K2OMaxGram   float64 // 2500
	Frekuensi    int     // 3
}

var DefaultKebutuhanHaraAlpukatGeneratif = KebutuhanHaraAlpukat{
	NMinGram:    1020,
	NMaxGram:    1630,
	P2O5MinGram: 1150,
	P2O5MaxGram: 1250,
	K2OMinGram:  2400,
	K2OMaxGram:  2500,
	Frekuensi:   3,
}

var DefaultKebutuhanHaraAlpukatVegetatif = KebutuhanHaraAlpukat{
	NMinGram:    200,
	NMaxGram:    400,
	P2O5MinGram: 150,
	P2O5MaxGram: 300,
	K2OMinGram:  200,
	K2OMaxGram:  400,
	Frekuensi:   2,
}

const (
	KandunganUrea = 0.46
	KandunganSP36 = 0.36
	KandunganKCl  = 0.60
)

func HitungPupukTunggal(hara KebutuhanHaraAlpukat) (ureaGram, sp36Gram, kclGram float64) {
	nRata := (hara.NMinGram + hara.NMaxGram) / 2.0
	pRata := (hara.P2O5MinGram + hara.P2O5MaxGram) / 2.0
	kRata := (hara.K2OMinGram + hara.K2OMaxGram) / 2.0

	ureaGram = math.Round((nRata/KandunganUrea)*100) / 100
	sp36Gram = math.Round((pRata/KandunganSP36)*100) / 100
	kclGram = math.Round((kRata/KandunganKCl)*100) / 100
	return
}

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
	PohonID           string       `json:"pohon_id"`
	Jenis             JenisTanaman `json:"jenis"`
	Fase              FasePohon    `json:"fase"`
	UsiaTahun         float64      `json:"usia_tahun"`
	DosisPerAplikasi  float64      `json:"dosis_per_aplikasi"`
	FrekuensiPerTahun int          `json:"frekuensi_per_tahun"`
	TotalPerTahun     float64      `json:"total_per_tahun"`
	Keterangan        string       `json:"keterangan"`
	UreaGramPerTahun  float64      `json:"urea_gram_per_tahun,omitempty"`
	SP36GramPerTahun  float64      `json:"sp36_gram_per_tahun,omitempty"`
	KClGramPerTahun   float64      `json:"kcl_gram_per_tahun,omitempty"`
}

// --- KONSTANTA & ASUMSI PUPUK ORGANIK CAIR (POC) ---
// Sumber Literatur: Jumar dkk. (2023), "Pupuk Organik Cair (POC): Keunggulan, Cara Pembuatan dan Aplikasi serta Pemasarannya", Resitasi Pustaka.

type KonfigPOC struct {
	RasioPupukLiter     float64 `json:"rasio_pupuk_liter"`     // 1  (liter POC)
	RasioAirLiter       float64 `json:"rasio_air_liter"`       // 100 (liter air) — rasio resmi 1:100 (hlm. 9)
	KepekatanMaksPersen float64 `json:"kepekatan_maks_persen"` // 2.0% (hlm. 9)
	FrekuensiMingguMin  int     `json:"frekuensi_minggu_min"`  // 2 minggu sekali (hlm. 79)
	FrekuensiMingguMax  int     `json:"frekuensi_minggu_max"`  // 4 minggu sekali (hlm. 79)
}

var DefaultKonfigPOC = KonfigPOC{
	RasioPupukLiter:     1,
	RasioAirLiter:       100,
	KepekatanMaksPersen: 2.0,
	FrekuensiMingguMin:  2,
	FrekuensiMingguMax:  4,
}

// VolumeLarutanPerPohon: ASUMSI TIM PERKEBUNAN (Volume larutan semprot/kocor per pohon per aplikasi)
type VolumeLarutanPerPohon struct {
	BelumProduktifLiter     float64 `json:"belum_produktif_liter"`     // 2.0 L (0-3 th)
	ProduktifVegetatifLiter float64 `json:"produktif_vegetatif_liter"` // 5.0 L (>4 th Vegetatif)
	ProduktifGeneratifLiter float64 `json:"produktif_generatif_liter"` // 8.0 L (>4 th Generatif)
}

var DefaultVolumeLarutan = VolumeLarutanPerPohon{
	BelumProduktifLiter:     2.0,
	ProduktifVegetatifLiter: 5.0,
	ProduktifGeneratifLiter: 8.0,
}

type StatusUsiaPohon string

const (
	UsiaBelumProduktif StatusUsiaPohon = "belum_produktif"
	UsiaProduktif      StatusUsiaPohon = "produktif"
)

type DataPohonPOC struct {
	ID          string          `json:"id"`
	Jenis       JenisTanaman    `json:"jenis"`
	Varietas    string          `json:"varietas"`
	StatusUsia  StatusUsiaPohon `json:"status_usia"`
	Fase        FasePohon       `json:"fase"`
	JumlahPohon int             `json:"jumlah_pohon"`
}

type HasilDosisPOC struct {
	PohonID                string          `json:"pohon_id"`
	Varietas               string          `json:"varietas"`
	StatusUsia             StatusUsiaPohon `json:"status_usia"`
	Fase                   FasePohon       `json:"fase"`
	JumlahPohon            int             `json:"jumlah_pohon"`
	VolumeLarutanPerPohonL float64         `json:"volume_larutan_per_pohon_l"`
	TotalVolumeLarutanL    float64         `json:"total_volume_larutan_l"`
	VolumePOCMurniL        float64         `json:"volume_poc_murni_l"`
	FrekuensiPerBulan      float64         `json:"frekuensi_per_bulan"`
	Keterangan             string          `json:"keterangan"`
}

func HitungDosisPOC(pohon DataPohonPOC, vol VolumeLarutanPerPohon, cfg KonfigPOC) HasilDosisPOC {
	if pohon.JumlahPohon <= 0 {
		pohon.JumlahPohon = 1
	}

	var volPerPohon float64
	var keterangan string

	switch pohon.StatusUsia {
	case UsiaBelumProduktif:
		volPerPohon = vol.BelumProduktifLiter
		keterangan = "Belum produktif (0–3 th) — fase tidak relevan. " +
			"Volume larutan ASUMSI tim (2.0L/pohon), rasio pengenceran resmi 1:100 (Jumar dkk., 2023)."

	case UsiaProduktif:
		switch pohon.Fase {
		case FaseVegetatif:
			volPerPohon = vol.ProduktifVegetatifLiter
			keterangan = "Produktif, fase vegetatif — merangsang pertumbuhan tunas/daun. " +
				"Volume larutan ASUMSI tim (5.0L/pohon), rasio 1:100 (Jumar dkk., 2023)."
		case FaseGeneratif, FaseGeneratifBuah, FaseGeneratifPraBunga:
			volPerPohon = vol.ProduktifGeneratifLiter
			keterangan = "Produktif, fase generatif — disemprot saat transisi " +
				"vegetatif ke generatif untuk merangsang buah (Jumar dkk., 2023, hlm.9). " +
				"Volume larutan ASUMSI tim (8.0L/pohon)."
		default:
			volPerPohon = vol.ProduktifVegetatifLiter
			keterangan = "Fase tidak dikenali untuk pohon produktif"
		}
	default:
		volPerPohon = vol.BelumProduktifLiter
		keterangan = "Status usia tidak dikenali"
	}

	totalLarutan := volPerPohon * float64(pohon.JumlahPohon)
	pocMurni := totalLarutan * (cfg.RasioPupukLiter / cfg.RasioAirLiter)
	frekuensiRataRata := float64(cfg.FrekuensiMingguMin+cfg.FrekuensiMingguMax) / 2.0

	return HasilDosisPOC{
		PohonID:                pohon.ID,
		Varietas:               pohon.Varietas,
		StatusUsia:             pohon.StatusUsia,
		Fase:                   pohon.Fase,
		JumlahPohon:            pohon.JumlahPohon,
		VolumeLarutanPerPohonL: volPerPohon,
		TotalVolumeLarutanL:    math.Round(totalLarutan*100) / 100,
		VolumePOCMurniL:        math.Round(pocMurni*100) / 100,
		FrekuensiPerBulan:      frekuensiRataRata,
		Keterangan:             keterangan,
	}
}

type DosisPupukResult struct {
	Kategori               KategoriPupuk `json:"kategori"`
	Dosis                  float64       `json:"dosis"`
	Satuan                 string        `json:"satuan"`
	Frekuensi              int           `json:"frekuensi"`
	UreaGram               float64       `json:"urea_gram,omitempty"`
	SP36Gram               float64       `json:"sp36_gram,omitempty"`
	KClGram                float64       `json:"kcl_gram,omitempty"`
	VolumeLarutanPerPohonL float64       `json:"volume_larutan_per_pohon_l,omitempty"`
	TotalVolumeLarutanL    float64       `json:"total_volume_larutan_l,omitempty"`
	VolumePOCMurniL        float64       `json:"volume_poc_murni_l,omitempty"`
	FrekuensiPerBulan      float64       `json:"frekuensi_per_bulan,omitempty"`
	Keterangan             string        `json:"keterangan"`
	DisclaimerCair         string        `json:"disclaimer_cair,omitempty"`
}

func HitungDosisPupuk(kategori KategoriPupuk, jenisTanaman JenisTanaman, fase FasePohon, usiaTahun float64) DosisPupukResult {
	switch kategori {
	case PupukOrganikPadat:
		var dosis float64
		var freq int
		var ket string
		if jenisTanaman == TanamanKelengkeng {
			dosis, freq, ket = HitungDosisKelengkeng(fase, usiaTahun, DefaultKelengkengDosis)
		} else {
			dosis, freq, ket = HitungDosisAlpukat(fase, usiaTahun, DefaultAlpukatDosis)
		}
		return DosisPupukResult{
			Kategori:   PupukOrganikPadat,
			Dosis:      dosis,
			Satuan:     "kg",
			Frekuensi:  freq,
			Keterangan: ket,
		}
	case PupukOrganikCair:
		statusUsia := UsiaProduktif
		if usiaTahun < 4.0 {
			statusUsia = UsiaBelumProduktif
		}
		dp := DataPohonPOC{
			Jenis:       jenisTanaman,
			StatusUsia:  statusUsia,
			Fase:        fase,
			JumlahPohon: 1,
		}
		resPOC := HitungDosisPOC(dp, DefaultVolumeLarutan, DefaultKonfigPOC)

		return DosisPupukResult{
			Kategori:               PupukOrganikCair,
			Dosis:                  resPOC.VolumePOCMurniL,
			Satuan:                 "Liter POC",
			Frekuensi:              int(resPOC.FrekuensiPerBulan),
			VolumeLarutanPerPohonL: resPOC.VolumeLarutanPerPohonL,
			TotalVolumeLarutanL:    resPOC.TotalVolumeLarutanL,
			VolumePOCMurniL:        resPOC.VolumePOCMurniL,
			FrekuensiPerBulan:      resPOC.FrekuensiPerBulan,
			Keterangan:             resPOC.Keterangan,
			DisclaimerCair:         "Rasio pengenceran resmi 1 Liter POC : 100 Liter Air (Jumar dkk., 2023). Kebutuhan larutan per pohon berdasarkan asumsi tajuk.",
		}
	case PupukKimia:
		hara := DefaultKebutuhanHaraAlpukatGeneratif
		if fase == FaseVegetatif {
			hara = DefaultKebutuhanHaraAlpukatVegetatif
		}
		urea, sp36, kcl := HitungPupukTunggal(hara)
		return DosisPupukResult{
			Kategori:   PupukKimia,
			Dosis:      0,
			Satuan:     "gram",
			Frekuensi:  hara.Frekuensi,
			UreaGram:   urea,
			SP36Gram:   sp36,
			KClGram:    kcl,
			Keterangan: "Dosis pupuk tunggal (Urea, SP-36, KCl) berbasis konversi hara murni",
		}
	default:
		return DosisPupukResult{}
	}
}

type HasilHitungKebun struct {
	DetailPohon            []HasilHitungPohon `json:"detail_pohon"`
	TotalKebutuhanKgTahun  float64            `json:"total_kebutuhan_kg_tahun"`
	TotalKebutuhanKgSiklus float64            `json:"total_kebutuhan_kg_siklus"`
	TotalUreaKgTahun       float64            `json:"total_urea_kg_tahun"`
	TotalSP36KgTahun       float64            `json:"total_sp36_kg_tahun"`
	TotalKClKgTahun        float64            `json:"total_kcl_kg_tahun"`
	StokTersediaKg         float64            `json:"stok_tersedia_kg"`
	StokAmanKg             float64            `json:"stok_aman_kg"`
	Cukup                  bool               `json:"cukup"`
	KekuranganKg           float64            `json:"kekurangan_kg"`
	SafetyFactor           float64            `json:"safety_factor"`
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

	hara := DefaultKebutuhanHaraAlpukatGeneratif
	if pohon.Fase == FaseVegetatif {
		hara = DefaultKebutuhanHaraAlpukatVegetatif
	}
	uG, spG, kcG := HitungPupukTunggal(hara)

	return HasilHitungPohon{
		PohonID:           pohon.ID,
		Jenis:             pohon.Jenis,
		Fase:              pohon.Fase,
		UsiaTahun:         pohon.UsiaTahun,
		DosisPerAplikasi:  dosis,
		FrekuensiPerTahun: frekuensi,
		TotalPerTahun:     totalPerTahun,
		Keterangan:        keterangan,
		UreaGramPerTahun:  uG * float64(hara.Frekuensi),
		SP36GramPerTahun:  spG * float64(hara.Frekuensi),
		KClGramPerTahun:   kcG * float64(hara.Frekuensi),
	}
}

func HitungKebutuhanKebun(daftarPohon []DataPohon, stokTersediaKg float64, safetyFactor float64) HasilHitungKebun {
	if safetyFactor <= 0 {
		safetyFactor = 1.0
	}

	var detail []HasilHitungPohon
	var totalTahun float64
	var totalUreaGram, totalSP36Gram, totalKClGram float64

	for _, pohon := range daftarPohon {
		hasil := HitungPerPohon(pohon)
		detail = append(detail, hasil)
		totalTahun += hasil.TotalPerTahun
		totalUreaGram += hasil.UreaGramPerTahun
		totalSP36Gram += hasil.SP36GramPerTahun
		totalKClGram += hasil.KClGramPerTahun
	}

	totalSiklus := math.Round((totalTahun/2)*100) / 100
	stokAman := math.Round(totalSiklus*safetyFactor*100) / 100
	kekurangan := math.Max(0, stokAman-stokTersediaKg)
	kekurangan = math.Round(kekurangan*100) / 100

	return HasilHitungKebun{
		DetailPohon:            detail,
		TotalKebutuhanKgTahun:  math.Round(totalTahun*100) / 100,
		TotalKebutuhanKgSiklus: totalSiklus,
		TotalUreaKgTahun:       math.Round((totalUreaGram/1000.0)*100) / 100,
		TotalSP36KgTahun:       math.Round((totalSP36Gram/1000.0)*100) / 100,
		TotalKClKgTahun:        math.Round((totalKClGram/1000.0)*100) / 100,
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
