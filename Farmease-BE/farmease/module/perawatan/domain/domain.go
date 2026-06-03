package domain

import (
	"context"
)

type Perawatan struct {
	IDPerawatan            int     `json:"id_perawatan" db:"id_perawatan"`
	AktivitasIDAktivitas   int     `json:"Aktivitas_id_aktivitas" db:"Aktivitas_id_aktivitas"`
	TanggalAktivitas       string  `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas     string  `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas   string  `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	JenisBahan             string  `json:"jenis_bahan" db:"jenis_bahan"`
	FasePohon              string  `json:"fase_pohon" db:"fase_pohon"`
	Dosis                  float64 `json:"dosis" db:"dosis"`
	Satuan                 string  `json:"satuan" db:"satuan"`
	BagianPohon            string  `json:"bagian_pohon" db:"bagian_pohon"`
	TeknikPerawatan        string  `json:"teknik_perawatan" db:"teknik_perawatan"`
	NamaObat               string  `json:"nama_obat" db:"nama_obat"`
	Deskripsi              string  `json:"deskripsi" db:"deskripsi"`
	DetailPohon            string  `json:"detail_pohon" db:"detail_pohon"`
	LahanIDLahan           int     `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PerawatanRepository interface {
	FindAll(ctx context.Context) ([]Perawatan, error)
	FindByID(ctx context.Context, id int) (*Perawatan, error)
	Store(ctx context.Context, perawatan *Perawatan) error
	Update(ctx context.Context, perawatan *Perawatan) error
	Delete(ctx context.Context, id int) error
}

type PerawatanUsecase interface {
	FindAll(ctx context.Context) ([]Perawatan, error)
	FindByID(ctx context.Context, id int) (*Perawatan, error)
	Create(ctx context.Context, perawatan *Perawatan) error
	Update(ctx context.Context, perawatan *Perawatan) error
	Delete(ctx context.Context, id int) error
}
