package postgresql

import (
	"context"
	"errors"

	"github.com/farmease/kebun-be/kebun/module/pencatatan_types/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) domain.Repository {
	return &repository{db: db}
}

func (r *repository) FindAllJenis(ctx context.Context) ([]domain.JenisPencatatan, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT nama_jenis_aktivitas
		FROM gardening.aktivitas
		WHERE nama_jenis_aktivitas <> ''
		ORDER BY nama_jenis_aktivitas ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.JenisPencatatan
	var idx int
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		list = append(list, domain.JenisPencatatan{
			IDJenis:   name,
			Nama:      name,
			SortOrder: idx,
			IsActive:  true,
		})
		idx++
	}
	return list, rows.Err()
}

func (r *repository) FindAllRincian(ctx context.Context) ([]domain.RincianPencatatan, error) {
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT nama_jenis_aktivitas, nama_rincian_aktivitas
		FROM gardening.aktivitas
		WHERE nama_jenis_aktivitas <> '' AND nama_rincian_aktivitas <> ''
		ORDER BY nama_jenis_aktivitas ASC, nama_rincian_aktivitas ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.RincianPencatatan
	var idx int
	for rows.Next() {
		var jenisNama, rincianNama string
		if err := rows.Scan(&jenisNama, &rincianNama); err != nil {
			return nil, err
		}
		list = append(list, domain.RincianPencatatan{
			IDRincian: rincianNama,
			JenisID:   jenisNama,
			JenisNama: jenisNama,
			Nama:      rincianNama,
			SortOrder: idx,
			IsActive:  true,
		})
		idx++
	}
	return list, rows.Err()
}

func (r *repository) FindRincianByJenisID(ctx context.Context, jenisID string) ([]domain.RincianPencatatan, error) {
	// jenisID is passed as the name of the category/jenis
	rows, err := r.db.Query(ctx, `
		SELECT DISTINCT nama_jenis_aktivitas, nama_rincian_aktivitas
		FROM gardening.aktivitas
		WHERE nama_jenis_aktivitas = $1 AND nama_rincian_aktivitas <> ''
		ORDER BY nama_rincian_aktivitas ASC
	`, jenisID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.RincianPencatatan
	var idx int
	for rows.Next() {
		var jenisNama, rincianNama string
		if err := rows.Scan(&jenisNama, &rincianNama); err != nil {
			return nil, err
		}
		list = append(list, domain.RincianPencatatan{
			IDRincian: rincianNama,
			JenisID:   jenisNama,
			JenisNama: jenisNama,
			Nama:      rincianNama,
			SortOrder: idx,
			IsActive:  true,
		})
		idx++
	}
	return list, rows.Err()
}

func (r *repository) FindJenisByNama(ctx context.Context, nama string) (*domain.JenisPencatatan, error) {
	var name string
	err := r.db.QueryRow(ctx, `
		SELECT DISTINCT nama_jenis_aktivitas
		FROM gardening.aktivitas
		WHERE nama_jenis_aktivitas = $1
		LIMIT 1
	`, nama).Scan(&name)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &domain.JenisPencatatan{
		IDJenis:   name,
		Nama:      name,
		SortOrder: 0,
		IsActive:  true,
	}, nil
}

func (r *repository) StoreJenis(ctx context.Context, j *domain.JenisPencatatan) error {
	// We can insert a template record (with an empty details field) to define this category
	// Lahan_id_lahan is left NULL for catalog templates
	err := r.db.QueryRow(ctx, `
		INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas)
		VALUES ($1, '')
		RETURNING id_aktivitas
	`, j.Nama).Scan(&j.IDJenis)
	j.IsActive = true
	return err
}

func (r *repository) StoreRincian(ctx context.Context, item *domain.RincianPencatatan) error {
	// We can insert a template record to define this category-detail relation
	err := r.db.QueryRow(ctx, `
		INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas)
		VALUES ($1, $2)
		RETURNING id_aktivitas
	`, item.JenisNama, item.Nama).Scan(&item.IDRincian)
	item.IsActive = true
	item.JenisID = item.JenisNama
	return err
}


