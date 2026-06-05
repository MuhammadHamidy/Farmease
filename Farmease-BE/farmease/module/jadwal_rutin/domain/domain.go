package domain

import (
	"context"
)

type JadwalRutin struct {
	IDJadwalRutin        int    `json:"id_jadwal_rutin" db:"id_jadwal_rutin"`
	Tanggal              string `json:"tanggal" db:"tanggal"` // YYYY-MM-DD HH:MM:SS format
	KategoriJadwal       string `json:"kategori_jadwal" db:"kategori_jadwal"`
	Deskripsi            string `json:"deskripsi" db:"deskripsi"`
	Interval             string `json:"interval" db:"interval"`
	StatusPencatatan     string `json:"status_pencatatan" db:"status_pencatatan"`
	Keterangan           string `json:"keterangan" db:"keterangan"`
	LahanIDLahan         int    `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
	AktivitasIDAktivitas int    `json:"Aktivitas_id_aktivitas" db:"Aktivitas_id_aktivitas"`
}

type JadwalRutinRepository interface {
	FindAll(ctx context.Context) ([]JadwalRutin, error)
	FindByID(ctx context.Context, id int) (*JadwalRutin, error)
	Store(ctx context.Context, pj *JadwalRutin) error
	Update(ctx context.Context, pj *JadwalRutin) error
	Delete(ctx context.Context, id int) error
}

type JadwalRutinUsecase interface {
	FindAll(ctx context.Context) ([]JadwalRutin, error)
	FindByID(ctx context.Context, id int) (*JadwalRutin, error)
	Create(ctx context.Context, pj *JadwalRutin) error
	Update(ctx context.Context, pj *JadwalRutin) error
	Delete(ctx context.Context, id int) error
}
