package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/status_aktivitas/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type statusAktivitasRepository struct {
	db *pgxpool.Pool
}

func NewStatusAktivitasRepository(db *pgxpool.Pool) domain.StatusAktivitasRepository {
	return &statusAktivitasRepository{db: db}
}

func (r *statusAktivitasRepository) FindAll(ctx context.Context) ([]domain.StatusAktivitas, error) {
	query := `
		SELECT 
			sa.id_status_aktivitas, 
			sa.Aktivitas_id_aktivitas, 
			sa.status, 
			sa.tanggal, 
			sa.keterangan,
			a.nama_jenis_aktivitas,
			a.nama_rincian_aktivitas
		FROM gardening.status_aktivitas sa
		LEFT JOIN gardening.aktivitas a ON sa.Aktivitas_id_aktivitas = a.id_aktivitas
		ORDER BY sa.id_status_aktivitas ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.StatusAktivitas
	for rows.Next() {
		var sa domain.StatusAktivitas
		var tTgl time.Time
		if err := rows.Scan(
			&sa.IDStatusAktivitas, 
			&sa.AktivitasIDAktivitas, 
			&sa.Status, 
			&tTgl, 
			&sa.Keterangan,
			&sa.NamaJenisAktivitas,
			&sa.NamaRincianAktivitas,
		); err != nil {
			return nil, err
		}
		sa.Tanggal = tTgl.Format("2006-01-02 15:04:05")
		list = append(list, sa)
	}
	return list, nil
}

func (r *statusAktivitasRepository) FindByID(ctx context.Context, id int) (*domain.StatusAktivitas, error) {
	query := `
		SELECT 
			sa.id_status_aktivitas, 
			sa.Aktivitas_id_aktivitas, 
			sa.status, 
			sa.tanggal, 
			sa.keterangan,
			a.nama_jenis_aktivitas,
			a.nama_rincian_aktivitas
		FROM gardening.status_aktivitas sa
		LEFT JOIN gardening.aktivitas a ON sa.Aktivitas_id_aktivitas = a.id_aktivitas
		WHERE sa.id_status_aktivitas = $1
	`
	var sa domain.StatusAktivitas
	var tTgl time.Time
	err := r.db.QueryRow(ctx, query, id).Scan(
		&sa.IDStatusAktivitas, 
		&sa.AktivitasIDAktivitas, 
		&sa.Status, 
		&tTgl, 
		&sa.Keterangan,
		&sa.NamaJenisAktivitas,
		&sa.NamaRincianAktivitas,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	sa.Tanggal = tTgl.Format("2006-01-02 15:04:05")
	return &sa, nil
}

func (r *statusAktivitasRepository) Store(ctx context.Context, sa *domain.StatusAktivitas) error {
	tTgl, err := parseTime(sa.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	query := `
		INSERT INTO gardening.status_aktivitas (Aktivitas_id_aktivitas, status, tanggal, keterangan) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id_status_aktivitas
	`
	err = r.db.QueryRow(ctx, query, sa.AktivitasIDAktivitas, sa.Status, tTgl, sa.Keterangan).Scan(&sa.IDStatusAktivitas)
	if err != nil {
		return err
	}

	// Fetch activity names
	actQuery := `SELECT nama_jenis_aktivitas, nama_rincian_aktivitas FROM gardening.aktivitas WHERE id_aktivitas = $1`
	var jenis, rincian string
	err = r.db.QueryRow(ctx, actQuery, sa.AktivitasIDAktivitas).Scan(&jenis, &rincian)
	if err == nil {
		sa.NamaJenisAktivitas = jenis
		sa.NamaRincianAktivitas = rincian
	}

	sa.Tanggal = tTgl.Format("2006-01-02 15:04:05")
	return nil
}

func (r *statusAktivitasRepository) Update(ctx context.Context, sa *domain.StatusAktivitas) error {
	tTgl, err := parseTime(sa.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	query := `
		UPDATE gardening.status_aktivitas 
		SET Aktivitas_id_aktivitas = $1, status = $2, tanggal = $3, keterangan = $4 
		WHERE id_status_aktivitas = $5
	`
	_, err = r.db.Exec(ctx, query, sa.AktivitasIDAktivitas, sa.Status, tTgl, sa.Keterangan, sa.IDStatusAktivitas)
	if err != nil {
		return err
	}

	// Fetch activity names
	actQuery := `SELECT nama_jenis_aktivitas, nama_rincian_aktivitas FROM gardening.aktivitas WHERE id_aktivitas = $1`
	var jenis, rincian string
	err = r.db.QueryRow(ctx, actQuery, sa.AktivitasIDAktivitas).Scan(&jenis, &rincian)
	if err == nil {
		sa.NamaJenisAktivitas = jenis
		sa.NamaRincianAktivitas = rincian
	}

	sa.Tanggal = tTgl.Format("2006-01-02 15:04:05")
	return nil
}

func (r *statusAktivitasRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.status_aktivitas WHERE id_status_aktivitas = $1", id)
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

