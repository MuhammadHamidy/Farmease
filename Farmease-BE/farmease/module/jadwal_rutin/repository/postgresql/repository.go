package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/jadwal_rutin/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type jadwalRutinRepository struct {
	db *pgxpool.Pool
}

func NewJadwalRutinRepository(db *pgxpool.Pool) domain.JadwalRutinRepository {
	return &jadwalRutinRepository{db: db}
}

func (r *jadwalRutinRepository) FindAll(ctx context.Context) ([]domain.JadwalRutin, error) {
	rows, err := r.db.Query(ctx, `SELECT id_jadwal_rutin, tanggal, kategori_jadwal, deskripsi, interval, status_pencatatan, keterangan, jam_tenggat, "Lahan_id_lahan", "Aktivitas_id_aktivitas" FROM gardening.jadwal_rutin ORDER BY id_jadwal_rutin ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.JadwalRutin
	for rows.Next() {
		var pj domain.JadwalRutin
		var tTgl time.Time
		if err := rows.Scan(&pj.IDJadwalRutin, &tTgl, &pj.KategoriJadwal, &pj.Deskripsi, &pj.Interval, &pj.StatusPencatatan, &pj.Keterangan, &pj.JamTenggat, &pj.LahanIDLahan, &pj.AktivitasIDAktivitas); err != nil {
			return nil, err
		}
		pj.Tanggal = tTgl.Format("2006-01-02 15:04:05")
		list = append(list, pj)
	}
	return list, nil
}

func (r *jadwalRutinRepository) FindByID(ctx context.Context, id int) (*domain.JadwalRutin, error) {
	var pj domain.JadwalRutin
	var tTgl time.Time
	err := r.db.QueryRow(ctx, `SELECT id_jadwal_rutin, tanggal, kategori_jadwal, deskripsi, interval, status_pencatatan, keterangan, jam_tenggat, "Lahan_id_lahan", "Aktivitas_id_aktivitas" FROM gardening.jadwal_rutin WHERE id_jadwal_rutin = $1`, id).
		Scan(&pj.IDJadwalRutin, &tTgl, &pj.KategoriJadwal, &pj.Deskripsi, &pj.Interval, &pj.StatusPencatatan, &pj.Keterangan, &pj.JamTenggat, &pj.LahanIDLahan, &pj.AktivitasIDAktivitas)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	pj.Tanggal = tTgl.Format("2006-01-02 15:04:05")
	return &pj, nil
}

func (r *jadwalRutinRepository) Store(ctx context.Context, pj *domain.JadwalRutin) error {
	tTgl, err := parseTime(pj.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	err = r.db.QueryRow(ctx, `INSERT INTO gardening.jadwal_rutin (tanggal, kategori_jadwal, deskripsi, interval, status_pencatatan, keterangan, jam_tenggat, "Lahan_id_lahan", "Aktivitas_id_aktivitas") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_jadwal_rutin`,
		tTgl, pj.KategoriJadwal, pj.Deskripsi, pj.Interval, pj.StatusPencatatan, pj.Keterangan, pj.JamTenggat, pj.LahanIDLahan, pj.AktivitasIDAktivitas).Scan(&pj.IDJadwalRutin)
	return err
}

func (r *jadwalRutinRepository) Update(ctx context.Context, pj *domain.JadwalRutin) error {
	tTgl, err := parseTime(pj.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	_, err = r.db.Exec(ctx, `UPDATE gardening.jadwal_rutin SET tanggal = $1, kategori_jadwal = $2, deskripsi = $3, interval = $4, status_pencatatan = $5, keterangan = $6, jam_tenggat = $7, "Lahan_id_lahan" = $8, "Aktivitas_id_aktivitas" = $9 WHERE id_jadwal_rutin = $10`,
		tTgl, pj.KategoriJadwal, pj.Deskripsi, pj.Interval, pj.StatusPencatatan, pj.Keterangan, pj.JamTenggat, pj.LahanIDLahan, pj.AktivitasIDAktivitas, pj.IDJadwalRutin)
	return err
}

func (r *jadwalRutinRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.jadwal_rutin WHERE id_jadwal_rutin = $1", id)
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

