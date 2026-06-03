package domain

import (
	"context"
)

type StatusAktivitas struct {
	IDStatusAktivitas    int    `json:"id_status_aktivitas" db:"id_status_aktivitas"`
	AktivitasIDAktivitas int    `json:"Aktivitas_id_aktivitas" db:"Aktivitas_id_aktivitas"`
	Status               string `json:"status" db:"status"`
	Tanggal              string `json:"tanggal" db:"tanggal"` // YYYY-MM-DD HH:MM:SS format
	Keterangan           string `json:"keterangan" db:"keterangan"`
	
	// Optional relation details for API response
	NamaJenisAktivitas   string `json:"nama_jenis_aktivitas,omitempty" db:"nama_jenis_aktivitas"`
	NamaRincianAktivitas string `json:"nama_rincian_aktivitas,omitempty" db:"nama_rincian_aktivitas"`
}

type StatusAktivitasRepository interface {
	FindAll(ctx context.Context) ([]StatusAktivitas, error)
	FindByID(ctx context.Context, id int) (*StatusAktivitas, error)
	Store(ctx context.Context, sa *StatusAktivitas) error
	Update(ctx context.Context, sa *StatusAktivitas) error
	Delete(ctx context.Context, id int) error
}

type StatusAktivitasUsecase interface {
	FindAll(ctx context.Context) ([]StatusAktivitas, error)
	FindByID(ctx context.Context, id int) (*StatusAktivitas, error)
	Create(ctx context.Context, sa *StatusAktivitas) error
	Update(ctx context.Context, sa *StatusAktivitas) error
	Delete(ctx context.Context, id int) error
}
