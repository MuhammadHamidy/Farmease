package domain

import (
	"context"
)

// FasePohon adalah nilai valid untuk kolom fase_pohon (ENUM di database).
// Shared dengan tabel perawatan.
type FasePohon = string

const (
	FasePohonPembibitan     FasePohon = "Pembibitan"
	FasePohonVegetatif      FasePohon = "Vegetatif"
	FasePohonGeneratif      FasePohon = "Generatif"
	FasePohonPanen          FasePohon = "Panen"
	FasePohonTidakProduktif FasePohon = "Tidak Produktif"
)

type Pohon struct {
	IDPohon      string `json:"id_pohon" db:"id_pohon"`
	KodePohon    string `json:"kode_pohon" db:"kode_pohon"`
	TanggalTanam string `json:"tanggal_tanam" db:"tanggal_tanam"` // YYYY-MM-DD format
	Varietas     string `json:"varietas" db:"varietas"`
	FasePohon    string `json:"fase_pohon" db:"fase_pohon"`
	LahanIDLahan string `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PohonDetail struct {
	Pohon
	JenisTanaman string `json:"jenis_tanaman" db:"jenis_tanaman"`
}

type PohonRepository interface {
	FindAll(ctx context.Context) ([]Pohon, error)
	FindAllWithDetail(ctx context.Context) ([]PohonDetail, error)
	FindByID(ctx context.Context, id string) (*Pohon, error)
	Store(ctx context.Context, pohon *Pohon) error
	Update(ctx context.Context, pohon *Pohon) error
	Delete(ctx context.Context, id string) error
}

type PohonUsecase interface {
	FindAll(ctx context.Context) ([]Pohon, error)
	FindByID(ctx context.Context, id string) (*Pohon, error)
	Create(ctx context.Context, pohon *Pohon) error
	Update(ctx context.Context, pohon *Pohon) error
	Delete(ctx context.Context, id string) error
}
