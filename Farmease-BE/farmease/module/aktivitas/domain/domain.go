package domain

import (
	"context"
)

type Aktivitas struct {
	IDAktivitas          int    `json:"id_aktivitas" db:"id_aktivitas"`
	TanggalAktivitas     string `json:"tanggal_aktivitas" db:"tanggal_aktivitas"` // YYYY-MM-DD HH:MM:SS format
	NamaJenisAktivitas   string `json:"nama_jenis_aktivitas" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string `json:"nama_rincian_aktivitas" db:"nama_rincian_aktivitas"`
	LahanIDLahan         int    `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type AktivitasRepository interface {
	FindAll(ctx context.Context) ([]Aktivitas, error)
	FindByID(ctx context.Context, id int) (*Aktivitas, error)
	Store(ctx context.Context, a *Aktivitas) error
	Update(ctx context.Context, a *Aktivitas) error
	Delete(ctx context.Context, id int) error
}

type AktivitasUsecase interface {
	FindAll(ctx context.Context) ([]Aktivitas, error)
	FindByID(ctx context.Context, id int) (*Aktivitas, error)
	Create(ctx context.Context, a *Aktivitas) error
	Update(ctx context.Context, a *Aktivitas) error
	Delete(ctx context.Context, id int) error
}
