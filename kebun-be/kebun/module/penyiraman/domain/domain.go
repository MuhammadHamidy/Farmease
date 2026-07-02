package domain

import (
	"context"
)

type Penyiraman struct {
	IDPenyiraman         string `json:"id_penyiraman" db:"id_penyiraman"`
	TanggalAktivitas     string `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas   string `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	TeknikPenyiraman     string `json:"teknik_penyiraman" db:"teknik_penyiraman"`
	Deskripsi            string `json:"deskripsi" db:"deskripsi"`
	LahanIDLahan         string `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PenyiramanRepository interface {
	FindAll(ctx context.Context) ([]Penyiraman, error)
	FindByID(ctx context.Context, id string) (*Penyiraman, error)
	Store(ctx context.Context, p *Penyiraman) error
	Update(ctx context.Context, p *Penyiraman) error
	Delete(ctx context.Context, id string) error
}

type PenyiramanUsecase interface {
	FindAll(ctx context.Context) ([]Penyiraman, error)
	FindByID(ctx context.Context, id string) (*Penyiraman, error)
	Create(ctx context.Context, p *Penyiraman) error
	Update(ctx context.Context, p *Penyiraman) error
	Delete(ctx context.Context, id string) error
}
