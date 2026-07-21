package domain

import (
	"context"
)

// JenisBahan adalah nilai valid untuk kolom jenis_bahan (ENUM di database).
type JenisBahan = string

const (
	JenisBahanObat        JenisBahan = "obat"
	JenisBahanPupuk       JenisBahan = "pupuk"
	JenisBahanPembersihan JenisBahan = "pembersihan"
	JenisBahanAir         JenisBahan = "air"
	JenisBahanBibit       JenisBahan = "bibit"
	JenisBahanHormon      JenisBahan = "hormon"
	JenisBahanUmum        JenisBahan = "umum"
)

// FasePohon adalah nilai valid untuk kolom fase_pohon (ENUM di database).
type FasePohon = string

const (
	FasePohonPembibitan     FasePohon = "Pembibitan"
	FasePohonVegetatif      FasePohon = "Vegetatif"
	FasePohonGeneratif      FasePohon = "Generatif"
	FasePohonPanen          FasePohon = "Panen"
	FasePohonTidakProduktif FasePohon = "Belum Produktif"
)

// BagianPohon adalah nilai valid untuk kolom bagian_pohon (ENUM di database).
type BagianPohon = string

const (
	BagianPohonDaun  BagianPohon = "Daun"
	BagianPohonAkar  BagianPohon = "Akar"
	BagianPohonBatang BagianPohon = "Batang"
	BagianPohonBuah  BagianPohon = "Buah"
	BagianPohonBunga BagianPohon = "Bunga"
	BagianPohonLahan BagianPohon = "Lahan"
	BagianPohonTanah BagianPohon = "Tanah"
	BagianPohonUmum  BagianPohon = "Umum"
)

type Perawatan struct {
	IDPerawatan          string  `json:"id_perawatan" db:"id_perawatan"`
	TanggalAktivitas     string  `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas   string  `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string  `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	JenisBahan           string  `json:"jenis_bahan" db:"jenis_bahan"`
	FasePohon            string  `json:"fase_pohon" db:"fase_pohon"`
	Dosis                float64 `json:"dosis" db:"dosis"`
	Satuan               string  `json:"satuan" db:"satuan"`
	BagianPohon          string  `json:"bagian_pohon" db:"bagian_pohon"`
	TeknikPerawatan      string  `json:"teknik_perawatan" db:"teknik_perawatan"`
	NamaObat             string  `json:"nama_obat" db:"nama_obat"`
	Deskripsi            string  `json:"deskripsi" db:"deskripsi"`
	DetailPohon          string  `json:"detail_pohon" db:"detail_pohon"`
	LahanIDLahan         string  `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PerawatanRepository interface {
	FindAll(ctx context.Context) ([]Perawatan, error)
	FindByID(ctx context.Context, id string) (*Perawatan, error)
	Store(ctx context.Context, perawatan *Perawatan) error
	Update(ctx context.Context, perawatan *Perawatan) error
	Delete(ctx context.Context, id string) error
}

type PerawatanUsecase interface {
	FindAll(ctx context.Context) ([]Perawatan, error)
	FindByID(ctx context.Context, id string) (*Perawatan, error)
	Create(ctx context.Context, perawatan *Perawatan) error
	Update(ctx context.Context, perawatan *Perawatan) error
	Delete(ctx context.Context, id string) error
	GetRekomendasiObat(ctx context.Context, varietas, fase, obat string) (string, error)
}
