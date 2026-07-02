package domain

import (
	"context"
)

type Pembuahan struct {
	IDPembuahan          string `json:"id_pembuahan" db:"id_pembuahan"`
	TanggalAktivitas     string `json:"tanggal_aktivitas,omitempty" db:"tanggal_aktivitas"`
	NamaJenisAktivitas   string `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
	FasePohon            string `json:"fase_pohon" db:"fase_pohon"`
	TeknikPembuahan      string `json:"teknik_pembuahan" db:"teknik_pembuahan"`
	Deskripsi            string `json:"deskripsi" db:"deskripsi"`
	LahanIDLahan         string `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PembuahanRepository interface {
	FindAll(ctx context.Context) ([]Pembuahan, error)
	FindByID(ctx context.Context, id string) (*Pembuahan, error)
	Store(ctx context.Context, p *Pembuahan) error
	Update(ctx context.Context, p *Pembuahan) error
	Delete(ctx context.Context, id string) error
}

type PembuahanUsecase interface {
	FindAll(ctx context.Context) ([]Pembuahan, error)
	FindByID(ctx context.Context, id string) (*Pembuahan, error)
	Create(ctx context.Context, p *Pembuahan) error
	Update(ctx context.Context, p *Pembuahan) error
	Delete(ctx context.Context, id string) error
}
