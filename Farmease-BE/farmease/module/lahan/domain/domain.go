package domain

import (
	"context"
)

type Lahan struct {
	IDLahan      int    `json:"id_lahan" db:"id_lahan"`
	KodeLahan    string `json:"kode_lahan" db:"kode_lahan"`
	StatusLahan  int    `json:"status_lahan" db:"status_lahan"`
	Varietas     string `json:"varietas" db:"varietas"`
	TanggalTanam string `json:"tanggal_tanam" db:"tanggal_tanam"`
	FaseTanam    string `json:"fase_tanam" db:"fase_tanam"`
}

type LahanRepository interface {
	FindAll(ctx context.Context) ([]Lahan, error)
	FindByID(ctx context.Context, id int) (*Lahan, error)
	FindByKodeLahan(ctx context.Context, kode string) (*Lahan, error)
	Store(ctx context.Context, lahan *Lahan) error
	Update(ctx context.Context, lahan *Lahan) error
	Delete(ctx context.Context, id int) error
}

type LahanUsecase interface {
	FindAll(ctx context.Context) ([]Lahan, error)
	FindByID(ctx context.Context, id int) (*Lahan, error)
	FindByKodeLahan(ctx context.Context, kode string) (*Lahan, error)
	Create(ctx context.Context, lahan *Lahan) error
	Update(ctx context.Context, lahan *Lahan) error
	Delete(ctx context.Context, id int) error
}
