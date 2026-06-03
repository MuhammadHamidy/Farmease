package domain

import (
	"context"
)

type AkunLahan struct {
	IDAkunLahan  int    `json:"id_akun_lahan" db:"id_akun_lahan"`
	TanggalTanam string `json:"tanggal_tanam" db:"tanggal_tanam"` // YYYY-MM-DD HH:MM:SS format
	Status       string `json:"status" db:"status"`
	LahanIDLahan int    `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
	AkunIDAkun   int    `json:"Akun_id_akun" db:"Akun_id_akun"`
}

type AkunLahanRepository interface {
	FindAll(ctx context.Context) ([]AkunLahan, error)
	FindByID(ctx context.Context, id int) (*AkunLahan, error)
	Store(ctx context.Context, al *AkunLahan) error
	Update(ctx context.Context, al *AkunLahan) error
	Delete(ctx context.Context, id int) error
}

type AkunLahanUsecase interface {
	FindAll(ctx context.Context) ([]AkunLahan, error)
	FindByID(ctx context.Context, id int) (*AkunLahan, error)
	Create(ctx context.Context, al *AkunLahan) error
	Update(ctx context.Context, al *AkunLahan) error
	Delete(ctx context.Context, id int) error
}
