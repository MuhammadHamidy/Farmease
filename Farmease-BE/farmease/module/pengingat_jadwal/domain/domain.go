package domain

import (
	"context"
)

type PengingatJadwal struct {
	IDPengingatJadwal                             int    `json:"id_pengingat_jadwal" db:"id_pengingat_jadwal"`
	Tanggal                                       string `json:"tanggal" db:"tanggal"` // YYYY-MM-DD HH:MM:SS format
	KategoriJadwal                                string `json:"kategori_jadwal" db:"kategori_jadwal"`
	Deskripsi                                     string `json:"deskripsi" db:"deskripsi"`
	Interval                                      string `json:"interval" db:"interval"`
	StatusPencatatan                              string `json:"status_pencatatan" db:"status_pencatatan"`
	Keterangan                                    string `json:"keterangan" db:"keterangan"`
	LahanIDLahan         int    `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
	AktivitasIDAktivitas int    `json:"Aktivitas_id_aktivitas" db:"Aktivitas_id_aktivitas"`
}

type PengingatJadwalRepository interface {
	FindAll(ctx context.Context) ([]PengingatJadwal, error)
	FindByID(ctx context.Context, id int) (*PengingatJadwal, error)
	Store(ctx context.Context, pj *PengingatJadwal) error
	Update(ctx context.Context, pj *PengingatJadwal) error
	Delete(ctx context.Context, id int) error
}

type PengingatJadwalUsecase interface {
	FindAll(ctx context.Context) ([]PengingatJadwal, error)
	FindByID(ctx context.Context, id int) (*PengingatJadwal, error)
	Create(ctx context.Context, pj *PengingatJadwal) error
	Update(ctx context.Context, pj *PengingatJadwal) error
	Delete(ctx context.Context, id int) error
}
