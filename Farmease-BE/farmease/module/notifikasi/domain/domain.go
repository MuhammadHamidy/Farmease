package domain

import (
	"context"
)

type Notifikasi struct {
	IDNotifikasi                     int    `json:"id_notifikasi" db:"id_notifikasi"`
	AkunIDAkun                       int    `json:"akun_id_akun" db:"akun_id_akun"`
	JadwalRutinIDJadwalRutin *int   `json:"jadwal_rutin_id_jadwal_rutin" db:"jadwal_rutin_id_jadwal_rutin"`
	TipeNotifikasi                   string `json:"tipe_notifikasi" db:"tipe_notifikasi"`
	Pesan                            string `json:"pesan" db:"pesan"`
	StatusNotifikasi                 string `json:"status_notifikasi" db:"status_notifikasi"`
	Tanggal                          string `json:"tanggal" db:"tanggal"` // YYYY-MM-DD HH:MM:SS format
}

type NotifikasiRepository interface {
	FindAll(ctx context.Context) ([]Notifikasi, error)
	FindByID(ctx context.Context, id int) (*Notifikasi, error)
	Store(ctx context.Context, n *Notifikasi) error
	Update(ctx context.Context, n *Notifikasi) error
	Delete(ctx context.Context, id int) error
}

type NotifikasiUsecase interface {
	FindAll(ctx context.Context) ([]Notifikasi, error)
	FindByID(ctx context.Context, id int) (*Notifikasi, error)
	Create(ctx context.Context, n *Notifikasi) error
	Update(ctx context.Context, n *Notifikasi) error
	Delete(ctx context.Context, id int) error
}
