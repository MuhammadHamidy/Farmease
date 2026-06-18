package postgresql

import (
	"context"
	"errors"

	"github.com/farmease/farmease-be/farmease/module/pencatatan_types/domain"
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
		SELECT id_jenis, nama, sort_order, is_active
		FROM gardening.pencatatan_jenis
		WHERE is_active = TRUE
		ORDER BY sort_order ASC, nama ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.JenisPencatatan
	for rows.Next() {
		var j domain.JenisPencatatan
		if err := rows.Scan(&j.IDJenis, &j.Nama, &j.SortOrder, &j.IsActive); err != nil {
			return nil, err
		}
		list = append(list, j)
	}
	return list, rows.Err()
}

func (r *repository) FindAllRincian(ctx context.Context) ([]domain.RincianPencatatan, error) {
	rows, err := r.db.Query(ctx, `
		SELECT r.id_rincian, r.jenis_id, j.nama, r.nama, r.sort_order, r.is_active
		FROM gardening.pencatatan_rincian r
		JOIN gardening.pencatatan_jenis j ON j.id_jenis = r.jenis_id
		WHERE r.is_active = TRUE AND j.is_active = TRUE
		ORDER BY j.sort_order ASC, r.sort_order ASC, r.nama ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.RincianPencatatan
	for rows.Next() {
		var item domain.RincianPencatatan
		if err := rows.Scan(&item.IDRincian, &item.JenisID, &item.JenisNama, &item.Nama, &item.SortOrder, &item.IsActive); err != nil {
			return nil, err
		}
		list = append(list, item)
	}
	return list, rows.Err()
}

func (r *repository) FindRincianByJenisID(ctx context.Context, jenisID string) ([]domain.RincianPencatatan, error) {
	rows, err := r.db.Query(ctx, `
		SELECT r.id_rincian, r.jenis_id, j.nama, r.nama, r.sort_order, r.is_active
		FROM gardening.pencatatan_rincian r
		JOIN gardening.pencatatan_jenis j ON j.id_jenis = r.jenis_id
		WHERE r.jenis_id = $1 AND r.is_active = TRUE
		ORDER BY r.sort_order ASC, r.nama ASC
	`, jenisID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.RincianPencatatan
	for rows.Next() {
		var item domain.RincianPencatatan
		if err := rows.Scan(&item.IDRincian, &item.JenisID, &item.JenisNama, &item.Nama, &item.SortOrder, &item.IsActive); err != nil {
			return nil, err
		}
		list = append(list, item)
	}
	return list, rows.Err()
}

func (r *repository) FindJenisByNama(ctx context.Context, nama string) (*domain.JenisPencatatan, error) {
	var j domain.JenisPencatatan
	err := r.db.QueryRow(ctx, `
		SELECT id_jenis, nama, sort_order, is_active
		FROM gardening.pencatatan_jenis
		WHERE nama = $1 AND is_active = TRUE
	`, nama).Scan(&j.IDJenis, &j.Nama, &j.SortOrder, &j.IsActive)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &j, nil
}

func (r *repository) StoreJenis(ctx context.Context, j *domain.JenisPencatatan) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO gardening.pencatatan_jenis (nama, sort_order)
		VALUES ($1, $2)
		RETURNING id_jenis, is_active
	`, j.Nama, j.SortOrder).Scan(&j.IDJenis, &j.IsActive)
}

func (r *repository) StoreRincian(ctx context.Context, item *domain.RincianPencatatan) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO gardening.pencatatan_rincian (jenis_id, nama, sort_order)
		VALUES ($1, $2, $3)
		RETURNING id_rincian, is_active
	`, item.JenisID, item.Nama, item.SortOrder).Scan(&item.IDRincian, &item.IsActive)
}
