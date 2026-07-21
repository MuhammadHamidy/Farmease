package domain

import (
	"context"
	"time"
)

type StokBahan struct {
	IDStokBahan  string    `json:"id_stok_bahan" db:"id_stok_bahan"`
	NamaBahan    string    `json:"nama_bahan" db:"nama_bahan"`
	StokTersedia float64   `json:"stok_tersedia" db:"stok_tersedia"`
	Satuan       string    `json:"satuan" db:"satuan"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type StokPupuk struct {
	IDStokPupuk  string    `json:"id_stok_pupuk" db:"id_stok_pupuk"`
	NamaPupuk    string    `json:"nama_pupuk" db:"nama_pupuk"`
	Kategori     string    `json:"kategori" db:"kategori"`
	StokTersedia float64   `json:"stok_tersedia" db:"stok_tersedia"`
	Satuan       string    `json:"satuan" db:"satuan"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type StokObat struct {
	IDStokObat   string    `json:"id_stok_obat" db:"id_stok_obat"`
	NamaObat     string    `json:"nama_obat" db:"nama_obat"`
	StokTersedia float64   `json:"stok_tersedia" db:"stok_tersedia"`
	Satuan       string    `json:"satuan" db:"satuan"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type StokRepository interface {
	// Bahan
	FindAllBahan(ctx context.Context) ([]*StokBahan, error)
	FindBahanByID(ctx context.Context, id string) (*StokBahan, error)
	StoreBahan(ctx context.Context, s *StokBahan) error
	UpdateBahanStock(ctx context.Context, id string, amount float64, typeAction string) error

	// Pupuk
	FindAllPupuk(ctx context.Context) ([]*StokPupuk, error)
	FindPupukByID(ctx context.Context, id string) (*StokPupuk, error)
	StorePupuk(ctx context.Context, s *StokPupuk) error
	UpdatePupukStock(ctx context.Context, id string, amount float64, typeAction string) error

	// Obat
	FindAllObat(ctx context.Context) ([]*StokObat, error)
	FindObatByID(ctx context.Context, id string) (*StokObat, error)
	StoreObat(ctx context.Context, s *StokObat) error
	UpdateObatStock(ctx context.Context, id string, amount float64, typeAction string) error
}

type StokUsecase interface {
	FindAllBahan(ctx context.Context) ([]*StokBahan, error)
	StoreBahan(ctx context.Context, s *StokBahan) error
	UpdateBahanStock(ctx context.Context, id string, amount float64, typeAction string) error

	FindAllPupuk(ctx context.Context) ([]*StokPupuk, error)
	StorePupuk(ctx context.Context, s *StokPupuk) error
	UpdatePupukStock(ctx context.Context, id string, amount float64, typeAction string) error

	FindAllObat(ctx context.Context) ([]*StokObat, error)
	StoreObat(ctx context.Context, s *StokObat) error
	UpdateObatStock(ctx context.Context, id string, amount float64, typeAction string) error
}
