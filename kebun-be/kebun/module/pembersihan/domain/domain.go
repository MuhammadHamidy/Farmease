package domain

import (
	"context"
)

type Pembersihan struct {
	IDPembersihan        string `json:"id_pembersihan" db:"id_pembersihan"`
	TanggalAktivitas     string `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas   string `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	TeknikPembersihan    string `json:"teknik_pembersihan" db:"teknik_pembersihan"`
	Deskripsi            string `json:"deskripsi" db:"deskripsi"`
	LahanIDLahan         string `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PembersihanRepository interface {
	FindAll(ctx context.Context) ([]Pembersihan, error)
	FindByID(ctx context.Context, id string) (*Pembersihan, error)
	Store(ctx context.Context, p *Pembersihan) error
	Update(ctx context.Context, p *Pembersihan) error
	Delete(ctx context.Context, id string) error
}

type PembersihanUsecase interface {
	FindAll(ctx context.Context) ([]Pembersihan, error)
	FindByID(ctx context.Context, id string) (*Pembersihan, error)
	Create(ctx context.Context, p *Pembersihan) error
	Update(ctx context.Context, p *Pembersihan) error
	Delete(ctx context.Context, id string) error
}
