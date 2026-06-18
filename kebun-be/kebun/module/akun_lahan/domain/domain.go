package domain

import (
	"context"
)

type AkunLahan struct {
	IDAkunLahan  string `json:"id_akun_lahan" db:"id_akun_lahan"`
	TanggalTanam string `json:"tanggal_tanam" db:"tanggal_tanam"` // YYYY-MM-DD HH:MM:SS format
	Status       string `json:"status" db:"status"`
	LahanIDLahan string `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
	AkunIDAkun   string `json:"Akun_id_akun" db:"Akun_id_akun"`
}

type AkunLahanRepository interface {
	FindAll(ctx context.Context) ([]AkunLahan, error)
	FindByID(ctx context.Context, id string) (*AkunLahan, error)
	Store(ctx context.Context, al *AkunLahan) error
	Update(ctx context.Context, al *AkunLahan) error
	Delete(ctx context.Context, id string) error
}

type AkunLahanUsecase interface {
	FindAll(ctx context.Context) ([]AkunLahan, error)
	FindByID(ctx context.Context, id string) (*AkunLahan, error)
	Create(ctx context.Context, al *AkunLahan) error
	Update(ctx context.Context, al *AkunLahan) error
	Delete(ctx context.Context, id string) error
}
