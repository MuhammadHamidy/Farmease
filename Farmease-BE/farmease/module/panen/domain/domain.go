package domain

import (
	"context"
)

type Panen struct {
	IDPanen                int    `json:"id_panen" db:"id_panen"`
	AktivitasIDAktivitas   int    `json:"Aktivitas_id_aktivitas" db:"Aktivitas_id_aktivitas"`
	TanggalAktivitas       string `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas     string `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas   string `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	Jumlah                 int    `json:"jumlah" db:"jumlah"`
	Satuan                 string `json:"satuan" db:"satuan"`
	LahanIDLahan           int    `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PanenRekap struct {
	Tahun       int    `json:"tahun"`
	TotalJumlah int    `json:"total_jumlah"`
	Satuan      string `json:"satuan"`
}

type PanenRepository interface {
	FindAll(ctx context.Context) ([]Panen, error)
	FindByID(ctx context.Context, id int) (*Panen, error)
	FindRekap(ctx context.Context) ([]PanenRekap, error)
	Store(ctx context.Context, panen *Panen) error
	Update(ctx context.Context, panen *Panen) error
	Delete(ctx context.Context, id int) error
}

type PanenUsecase interface {
	FindAll(ctx context.Context) ([]Panen, error)
	FindByID(ctx context.Context, id int) (*Panen, error)
	FindRekap(ctx context.Context) ([]PanenRekap, error)
	Create(ctx context.Context, panen *Panen) error
	Update(ctx context.Context, panen *Panen) error
	Delete(ctx context.Context, id int) error
}
