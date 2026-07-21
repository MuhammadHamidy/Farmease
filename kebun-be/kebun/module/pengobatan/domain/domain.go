package domain

import (
	"context"
)

type Pengobatan struct {
	IDPengobatan         string  `json:"id_pengobatan" db:"id_pengobatan"`
	TanggalAktivitas     string  `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas   string  `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string  `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	NamaObat             string  `json:"nama_obat" db:"nama_obat"`
	Dosis                float64 `json:"dosis" db:"dosis"`
	Satuan               string  `json:"satuan" db:"satuan"`
	BagianPohon          string  `json:"bagian_pohon" db:"bagian_pohon"`
	Deskripsi            string  `json:"deskripsi" db:"deskripsi"`
	DetailPohon          string  `json:"detail_pohon" db:"detail_pohon"`
	LahanIDLahan         string  `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PengobatanRepository interface {
	FindAll(ctx context.Context) ([]Pengobatan, error)
	FindByID(ctx context.Context, id string) (*Pengobatan, error)
	Store(ctx context.Context, p *Pengobatan) error
	Update(ctx context.Context, p *Pengobatan) error
	Delete(ctx context.Context, id string) error
}

type PengobatanUsecase interface {
	FindAll(ctx context.Context) ([]Pengobatan, error)
	FindByID(ctx context.Context, id string) (*Pengobatan, error)
	Create(ctx context.Context, p *Pengobatan) error
	Update(ctx context.Context, p *Pengobatan) error
	Delete(ctx context.Context, id string) error
	GetRekomendasiObat(ctx context.Context, varietas, fase, obat string) (string, error)
}
