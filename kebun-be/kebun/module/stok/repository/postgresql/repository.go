package postgresql

import (
	"context"
	"errors"

	"github.com/farmease/kebun-be/kebun/module/stok/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type stokRepository struct {
	db *pgxpool.Pool
}

func NewStokRepository(db *pgxpool.Pool) domain.StokRepository {
	return &stokRepository{db: db}
}

// === BAHAN ===

func (r *stokRepository) FindAllBahan(ctx context.Context) ([]*domain.StokBahan, error) {
	query := `SELECT id_stok_bahan, nama_bahan, stok_tersedia, satuan, created_at, updated_at FROM gardening.stok_bahan ORDER BY nama_bahan`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.StokBahan
	for rows.Next() {
		s := &domain.StokBahan{}
		if err := rows.Scan(&s.IDStokBahan, &s.NamaBahan, &s.StokTersedia, &s.Satuan, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *stokRepository) FindBahanByID(ctx context.Context, id string) (*domain.StokBahan, error) {
	s := &domain.StokBahan{}
	query := `SELECT id_stok_bahan, nama_bahan, stok_tersedia, satuan, created_at, updated_at FROM gardening.stok_bahan WHERE id_stok_bahan = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(&s.IDStokBahan, &s.NamaBahan, &s.StokTersedia, &s.Satuan, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return s, nil
}

func (r *stokRepository) StoreBahan(ctx context.Context, s *domain.StokBahan) error {
	query := `INSERT INTO gardening.stok_bahan (nama_bahan, stok_tersedia, satuan) VALUES ($1, $2, $3) RETURNING id_stok_bahan, created_at, updated_at`
	return r.db.QueryRow(ctx, query, s.NamaBahan, s.StokTersedia, s.Satuan).Scan(&s.IDStokBahan, &s.CreatedAt, &s.UpdatedAt)
}

func (r *stokRepository) UpdateBahanStock(ctx context.Context, id string, amount float64, typeAction string) error {
	var query string
	if typeAction == "tambah" {
		query = `UPDATE gardening.stok_bahan SET stok_tersedia = stok_tersedia + $1, updated_at = CURRENT_TIMESTAMP WHERE id_stok_bahan = $2`
	} else {
		query = `UPDATE gardening.stok_bahan SET stok_tersedia = GREATEST(0.00, stok_tersedia - $1), updated_at = CURRENT_TIMESTAMP WHERE id_stok_bahan = $2`
	}
	_, err := r.db.Exec(ctx, query, amount, id)
	return err
}

// === PUPUK ===

func (r *stokRepository) FindAllPupuk(ctx context.Context) ([]*domain.StokPupuk, error) {
	query := `SELECT id_stok_pupuk, nama_pupuk, kategori, stok_tersedia, satuan, created_at, updated_at FROM gardening.stok_pupuk ORDER BY nama_pupuk`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.StokPupuk
	for rows.Next() {
		s := &domain.StokPupuk{}
		if err := rows.Scan(&s.IDStokPupuk, &s.NamaPupuk, &s.Kategori, &s.StokTersedia, &s.Satuan, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *stokRepository) FindPupukByID(ctx context.Context, id string) (*domain.StokPupuk, error) {
	s := &domain.StokPupuk{}
	query := `SELECT id_stok_pupuk, nama_pupuk, kategori, stok_tersedia, satuan, created_at, updated_at FROM gardening.stok_pupuk WHERE id_stok_pupuk = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(&s.IDStokPupuk, &s.NamaPupuk, &s.Kategori, &s.StokTersedia, &s.Satuan, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return s, nil
}

func (r *stokRepository) StorePupuk(ctx context.Context, s *domain.StokPupuk) error {
	query := `INSERT INTO gardening.stok_pupuk (nama_pupuk, kategori, stok_tersedia, satuan) VALUES ($1, $2, $3, $4) RETURNING id_stok_pupuk, created_at, updated_at`
	return r.db.QueryRow(ctx, query, s.NamaPupuk, s.Kategori, s.StokTersedia, s.Satuan).Scan(&s.IDStokPupuk, &s.CreatedAt, &s.UpdatedAt)
}

func (r *stokRepository) UpdatePupukStock(ctx context.Context, id string, amount float64, typeAction string) error {
	var query string
	if typeAction == "tambah" {
		query = `UPDATE gardening.stok_pupuk SET stok_tersedia = stok_tersedia + $1, updated_at = CURRENT_TIMESTAMP WHERE id_stok_pupuk = $2`
	} else {
		query = `UPDATE gardening.stok_pupuk SET stok_tersedia = GREATEST(0.00, stok_tersedia - $1), updated_at = CURRENT_TIMESTAMP WHERE id_stok_pupuk = $2`
	}
	_, err := r.db.Exec(ctx, query, amount, id)
	return err
}

// === OBAT ===

func (r *stokRepository) FindAllObat(ctx context.Context) ([]*domain.StokObat, error) {
	query := `SELECT id_stok_obat, nama_obat, stok_tersedia, satuan, created_at, updated_at FROM gardening.stok_obat ORDER BY nama_obat`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.StokObat
	for rows.Next() {
		s := &domain.StokObat{}
		if err := rows.Scan(&s.IDStokObat, &s.NamaObat, &s.StokTersedia, &s.Satuan, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, nil
}

func (r *stokRepository) FindObatByID(ctx context.Context, id string) (*domain.StokObat, error) {
	s := &domain.StokObat{}
	query := `SELECT id_stok_obat, nama_obat, stok_tersedia, satuan, created_at, updated_at FROM gardening.stok_obat WHERE id_stok_obat = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(&s.IDStokObat, &s.NamaObat, &s.StokTersedia, &s.Satuan, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return s, nil
}

func (r *stokRepository) StoreObat(ctx context.Context, s *domain.StokObat) error {
	query := `INSERT INTO gardening.stok_obat (nama_obat, stok_tersedia, satuan) VALUES ($1, $2, $3) RETURNING id_stok_obat, created_at, updated_at`
	return r.db.QueryRow(ctx, query, s.NamaObat, s.StokTersedia, s.Satuan).Scan(&s.IDStokObat, &s.CreatedAt, &s.UpdatedAt)
}

func (r *stokRepository) UpdateObatStock(ctx context.Context, id string, amount float64, typeAction string) error {
	var query string
	if typeAction == "tambah" {
		query = `UPDATE gardening.stok_obat SET stok_tersedia = stok_tersedia + $1, updated_at = CURRENT_TIMESTAMP WHERE id_stok_obat = $2`
	} else {
		query = `UPDATE gardening.stok_obat SET stok_tersedia = GREATEST(0.00, stok_tersedia - $1), updated_at = CURRENT_TIMESTAMP WHERE id_stok_obat = $2`
	}
	_, err := r.db.Exec(ctx, query, amount, id)
	return err
}

