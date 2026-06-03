package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/aktivitas/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type aktivitasRepository struct {
	db *pgxpool.Pool
}

func NewAktivitasRepository(db *pgxpool.Pool) domain.AktivitasRepository {
	return &aktivitasRepository{db: db}
}

func (r *aktivitasRepository) FindAll(ctx context.Context) ([]domain.Aktivitas, error) {
	rows, err := r.db.Query(ctx, "SELECT id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan FROM gardening.aktivitas ORDER BY id_aktivitas ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Aktivitas
	for rows.Next() {
		var a domain.Aktivitas
		var tTgl time.Time
		if err := rows.Scan(&a.IDAktivitas, &tTgl, &a.NamaJenisAktivitas, &a.NamaRincianAktivitas, &a.LahanIDLahan); err != nil {
			return nil, err
		}
		a.TanggalAktivitas = tTgl.Format("2006-01-02 15:04:05")
		list = append(list, a)
	}
	return list, nil
}

func (r *aktivitasRepository) FindByID(ctx context.Context, id int) (*domain.Aktivitas, error) {
	var a domain.Aktivitas
	var tTgl time.Time
	err := r.db.QueryRow(ctx, "SELECT id_aktivitas, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan FROM gardening.aktivitas WHERE id_aktivitas = $1", id).
		Scan(&a.IDAktivitas, &tTgl, &a.NamaJenisAktivitas, &a.NamaRincianAktivitas, &a.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	a.TanggalAktivitas = tTgl.Format("2006-01-02 15:04:05")
	return &a, nil
}

func (r *aktivitasRepository) Store(ctx context.Context, a *domain.Aktivitas) error {
	tTgl, err := parseTime(a.TanggalAktivitas)
	if err != nil {
		tTgl = time.Now()
	}
	err = r.db.QueryRow(ctx, "INSERT INTO gardening.aktivitas (tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES ($1, $2, $3, $4) RETURNING id_aktivitas",
		tTgl, a.NamaJenisAktivitas, a.NamaRincianAktivitas, a.LahanIDLahan).Scan(&a.IDAktivitas)
	if err != nil {
		return err
	}
	a.TanggalAktivitas = tTgl.Format("2006-01-02 15:04:05")
	return nil
}

func (r *aktivitasRepository) Update(ctx context.Context, a *domain.Aktivitas) error {
	tTgl, err := parseTime(a.TanggalAktivitas)
	if err != nil {
		tTgl = time.Now()
	}
	_, err = r.db.Exec(ctx, "UPDATE gardening.aktivitas SET tanggal_aktivitas = $1, nama_jenis_aktivitas = $2, nama_rincian_aktivitas = $3, Lahan_id_lahan = $4 WHERE id_aktivitas = $5",
		tTgl, a.NamaJenisAktivitas, a.NamaRincianAktivitas, a.LahanIDLahan, a.IDAktivitas)
	if err != nil {
		return err
	}
	a.TanggalAktivitas = tTgl.Format("2006-01-02 15:04:05")
	return nil
}

func (r *aktivitasRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.aktivitas WHERE id_aktivitas = $1", id)
	return err
}

func parseTime(val string) (time.Time, error) {
	if t, err := time.Parse("2006-01-02 15:04:05", val); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02T15:04:05Z", val); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02", val); err == nil {
		return t, nil
	}
	return time.Time{}, errors.New("invalid time format")
}

