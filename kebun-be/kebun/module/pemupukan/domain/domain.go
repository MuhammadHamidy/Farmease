package domain

import (
	"context"
	"time"
)

type Pemupukan struct {
	IDPemupukan          string    `json:"id_pemupukan" db:"id_pemupukan"`
	NamaPupuk            string    `json:"nama_pupuk" db:"nama_pupuk"`
	Dosis                float64   `json:"dosis" db:"dosis"`
	Satuan               string    `json:"satuan" db:"satuan"`
	Deskripsi            string    `json:"deskripsi" db:"deskripsi"`
	ManureID             *string   `json:"manure_id,omitempty" db:"manure_id"`
	IDStokPupuk          *string   `json:"id_stok_pupuk,omitempty" db:"id_stok_pupuk"`
	LahanIDLahan         string    `json:"Lahan_id_lahan" db:"Lahan_id_lahan"`
	AktivitasIDAktivitas string    `json:"Aktivitas_id_aktivitas" db:"Aktivitas_id_aktivitas"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time `json:"updated_at" db:"updated_at"`
}

type PemupukanRepository interface {
	FindAll(ctx context.Context) ([]*Pemupukan, error)
	FindByID(ctx context.Context, id string) (*Pemupukan, error)
	Store(ctx context.Context, p *Pemupukan) error
	Update(ctx context.Context, p *Pemupukan) error
	Delete(ctx context.Context, id string) error
}

type PemupukanUsecase interface {
	FindAll(ctx context.Context) ([]*Pemupukan, error)
	FindByID(ctx context.Context, id string) (*Pemupukan, error)
	Create(ctx context.Context, p *Pemupukan) error
	Update(ctx context.Context, p *Pemupukan) error
	Delete(ctx context.Context, id string) error
}
