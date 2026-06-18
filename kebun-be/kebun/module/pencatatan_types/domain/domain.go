package domain

import "context"

type JenisPencatatan struct {
	IDJenis    string `json:"id_jenis" db:"id_jenis"`
	Nama       string `json:"nama" db:"nama"`
	SortOrder  int    `json:"sort_order" db:"sort_order"`
	IsActive   bool   `json:"is_active" db:"is_active"`
}

type RincianPencatatan struct {
	IDRincian string `json:"id_rincian" db:"id_rincian"`
	JenisID   string `json:"jenis_id" db:"jenis_id"`
	JenisNama string `json:"jenis_nama,omitempty" db:"jenis_nama"`
	Nama      string `json:"nama" db:"nama"`
	SortOrder int    `json:"sort_order" db:"sort_order"`
	IsActive  bool   `json:"is_active" db:"is_active"`
}

type Catalog struct {
	Jenis          []JenisPencatatan            `json:"jenis"`
	RincianByJenis map[string][]RincianPencatatan `json:"rincian_by_jenis"`
}

type CreateJenisInput struct {
	Nama      string `json:"nama"`
	SortOrder *int   `json:"sort_order"`
}

type CreateRincianInput struct {
	JenisID   string `json:"jenis_id"`
	JenisNama string `json:"jenis_nama"`
	Nama      string `json:"nama"`
	SortOrder *int   `json:"sort_order"`
}

type Repository interface {
	FindAllJenis(ctx context.Context) ([]JenisPencatatan, error)
	FindAllRincian(ctx context.Context) ([]RincianPencatatan, error)
	FindRincianByJenisID(ctx context.Context, jenisID string) ([]RincianPencatatan, error)
	FindJenisByNama(ctx context.Context, nama string) (*JenisPencatatan, error)
	StoreJenis(ctx context.Context, j *JenisPencatatan) error
	StoreRincian(ctx context.Context, r *RincianPencatatan) error
}

type Usecase interface {
	GetCatalog(ctx context.Context) (*Catalog, error)
	GetRincianByJenisNama(ctx context.Context, jenisNama string) ([]RincianPencatatan, error)
	CreateJenis(ctx context.Context, input CreateJenisInput) (*JenisPencatatan, error)
	CreateRincian(ctx context.Context, input CreateRincianInput) (*RincianPencatatan, error)
}
