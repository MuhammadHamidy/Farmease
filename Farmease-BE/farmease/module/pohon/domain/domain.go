package domain

import (
	"context"
)

type Pohon struct {
	IDPohon      int    `json:"id_pohon" db:"id_pohon"`
	KodePohon    string `json:"kode_pohon" db:"kode_pohon"`
	TanggalTanam string `json:"tanggal_tanam" db:"tanggal_tanam"` // YYYY-MM-DD format
	Varietas     string `json:"varietas" db:"varietas"`
	FasePohon    string `json:"fase_pohon" db:"fase_pohon"`
	LahanIDLahan int    `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
}

type PohonRepository interface {
	FindAll(ctx context.Context) ([]Pohon, error)
	FindByID(ctx context.Context, id int) (*Pohon, error)
	Store(ctx context.Context, pohon *Pohon) error
	Update(ctx context.Context, pohon *Pohon) error
	Delete(ctx context.Context, id int) error
}

type PohonUsecase interface {
	FindAll(ctx context.Context) ([]Pohon, error)
	FindByID(ctx context.Context, id int) (*Pohon, error)
	Create(ctx context.Context, pohon *Pohon) error
	Update(ctx context.Context, pohon *Pohon) error
	Delete(ctx context.Context, id int) error
}
