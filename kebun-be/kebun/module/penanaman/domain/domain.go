package domain

import (
	"context"
)

type Penanaman struct {
	IDPenanaman          string `json:"id_penanaman" db:"id_penanaman"`
	TanggalAktivitas     string `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas   string `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	FasePohon            string `json:"fase_pohon" db:"fase_pohon"`
	Varietas             string `json:"varietas" db:"varietas"`
	Deskripsi            string `json:"deskripsi" db:"deskripsi"`
	LahanIDLahan         string `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PenanamanRepository interface {
	FindAll(ctx context.Context) ([]Penanaman, error)
	FindByID(ctx context.Context, id string) (*Penanaman, error)
	Store(ctx context.Context, p *Penanaman) error
	Update(ctx context.Context, p *Penanaman) error
	Delete(ctx context.Context, id string) error
}

type PenanamanUsecase interface {
	FindAll(ctx context.Context) ([]Penanaman, error)
	FindByID(ctx context.Context, id string) (*Penanaman, error)
	Create(ctx context.Context, p *Penanaman) error
	Update(ctx context.Context, p *Penanaman) error
	Delete(ctx context.Context, id string) error
}
