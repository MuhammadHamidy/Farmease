package domain

import (
	"context"
	"time"
)

type Fermentasi struct {
	IDFermentasi string             `json:"id_fermentasi" db:"id_fermentasi"`
	TanggalMulai time.Time          `json:"tanggal_mulai" db:"tanggal_mulai"`
	Status       string             `json:"status" db:"status"`
	Notes        string             `json:"notes" db:"notes"`
	IDAccount    *string            `json:"id_account,omitempty" db:"id_account"`
	PupukDetails *FermentasiPupuk   `json:"pupuk_details,omitempty"`
	Logs         []*LogFermentasi   `json:"logs,omitempty"`
	CreatedAt    time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at" db:"updated_at"`
}

type FermentasiPupuk struct {
	IDFermentasiPupuk string    `json:"id_fermentasi_pupuk" db:"id_fermentasi_pupuk"`
	TargetPupukName   string    `json:"target_pupuk_name" db:"target_pupuk_name"`
	TargetJumlah      float64   `json:"target_jumlah" db:"target_jumlah"`
	Satuan            string    `json:"satuan" db:"satuan"`
	IDStokBahan       *string   `json:"id_stok_bahan,omitempty" db:"id_stok_bahan"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}

type LogFermentasi struct {
	IDLog        string    `json:"id_log" db:"id_log"`
	IDFermentasi string    `json:"id_fermentasi" db:"id_fermentasi"`
	TanggalCek   time.Time `json:"tanggal_cek" db:"tanggal_cek"`
	Suhu         *float64  `json:"suhu" db:"suhu"`
	Kelembaban   *float64  `json:"kelembaban" db:"kelembaban"`
	KondisiFisik string    `json:"kondisi_fisik" db:"kondisi_fisik"`
	Notes        string    `json:"notes" db:"notes"`
	Status       string    `json:"status" db:"status"`
	IDAccount    *string   `json:"id_account,omitempty" db:"id_account"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type FermentasiRepository interface {
	FindAll(ctx context.Context) ([]*Fermentasi, error)
	FindByID(ctx context.Context, id string) (*Fermentasi, error)
	Store(ctx context.Context, f *Fermentasi) error
	UpdateStatus(ctx context.Context, id string, status string, notes string) error

	// Logs
	FindLogsByFermentasiID(ctx context.Context, fermentasiID string) ([]*LogFermentasi, error)
	StoreLog(ctx context.Context, l *LogFermentasi) error
}

type FermentasiUsecase interface {
	FindAll(ctx context.Context) ([]*Fermentasi, error)
	FindByID(ctx context.Context, id string) (*Fermentasi, error)
	CreatePupukFermentasi(ctx context.Context, f *Fermentasi) error
	UpdateStatus(ctx context.Context, id string, status string, notes string) error
	AddLog(ctx context.Context, l *LogFermentasi) error
}
