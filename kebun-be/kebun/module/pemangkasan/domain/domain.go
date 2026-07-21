package domain

import (
	"context"
)

type Pemangkasan struct {
	IDPemangkasan        string `json:"id_pemangkasan" db:"id_pemangkasan"`
	TanggalAktivitas     string `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas   string `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	Jumlah               string `json:"jumlah" db:"jumlah"`
	Satuan               string `json:"satuan" db:"satuan"`
	Keterangan           string `json:"keterangan" db:"keterangan"`
	LahanIDLahan         string `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PemangkasanRepository interface {
	FindAll(ctx context.Context) ([]Pemangkasan, error)
	FindByID(ctx context.Context, id string) (*Pemangkasan, error)
	Store(ctx context.Context, pemangkasan *Pemangkasan) error
	Update(ctx context.Context, pemangkasan *Pemangkasan) error
	Delete(ctx context.Context, id string) error
}

type PemangkasanUsecase interface {
	FindAll(ctx context.Context) ([]Pemangkasan, error)
	FindByID(ctx context.Context, id string) (*Pemangkasan, error)
	Create(ctx context.Context, pemangkasan *Pemangkasan) error
	Update(ctx context.Context, pemangkasan *Pemangkasan) error
	Delete(ctx context.Context, id string) error
}
