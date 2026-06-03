package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/pengingat_jadwal/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pengingatJadwalRepository struct {
	db *pgxpool.Pool
}

func NewPengingatJadwalRepository(db *pgxpool.Pool) domain.PengingatJadwalRepository {
	return &pengingatJadwalRepository{db: db}
}

func (r *pengingatJadwalRepository) FindAll(ctx context.Context) ([]domain.PengingatJadwal, error) {
	rows, err := r.db.Query(ctx, `SELECT id_pengingat_jadwal, tanggal, kategori_jadwal, deskripsi, interval, status_pencatatan, keterangan, "Lahan_id_lahan", "Aktivitas_id_aktivitas" FROM gardening.pengingat_jadwal ORDER BY id_pengingat_jadwal ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.PengingatJadwal
	for rows.Next() {
		var pj domain.PengingatJadwal
		var tTgl time.Time
		if err := rows.Scan(&pj.IDPengingatJadwal, &tTgl, &pj.KategoriJadwal, &pj.Deskripsi, &pj.Interval, &pj.StatusPencatatan, &pj.Keterangan, &pj.LahanIDLahan, &pj.AktivitasIDAktivitas); err != nil {
			return nil, err
		}
		pj.Tanggal = tTgl.Format("2006-01-02 15:04:05")
		list = append(list, pj)
	}
	return list, nil
}

func (r *pengingatJadwalRepository) FindByID(ctx context.Context, id int) (*domain.PengingatJadwal, error) {
	var pj domain.PengingatJadwal
	var tTgl time.Time
	err := r.db.QueryRow(ctx, `SELECT id_pengingat_jadwal, tanggal, kategori_jadwal, deskripsi, interval, status_pencatatan, keterangan, "Lahan_id_lahan", "Aktivitas_id_aktivitas" FROM gardening.pengingat_jadwal WHERE id_pengingat_jadwal = $1`, id).
		Scan(&pj.IDPengingatJadwal, &tTgl, &pj.KategoriJadwal, &pj.Deskripsi, &pj.Interval, &pj.StatusPencatatan, &pj.Keterangan, &pj.LahanIDLahan, &pj.AktivitasIDAktivitas)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	pj.Tanggal = tTgl.Format("2006-01-02 15:04:05")
	return &pj, nil
}

func (r *pengingatJadwalRepository) Store(ctx context.Context, pj *domain.PengingatJadwal) error {
	tTgl, err := parseTime(pj.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	err = r.db.QueryRow(ctx, `INSERT INTO gardening.pengingat_jadwal (tanggal, kategori_jadwal, deskripsi, interval, status_pencatatan, keterangan, "Lahan_id_lahan", "Aktivitas_id_aktivitas") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_pengingat_jadwal`,
		tTgl, pj.KategoriJadwal, pj.Deskripsi, pj.Interval, pj.StatusPencatatan, pj.Keterangan, pj.LahanIDLahan, pj.AktivitasIDAktivitas).Scan(&pj.IDPengingatJadwal)
	return err
}

func (r *pengingatJadwalRepository) Update(ctx context.Context, pj *domain.PengingatJadwal) error {
	tTgl, err := parseTime(pj.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	_, err = r.db.Exec(ctx, `UPDATE gardening.pengingat_jadwal SET tanggal = $1, kategori_jadwal = $2, deskripsi = $3, interval = $4, status_pencatatan = $5, keterangan = $6, "Lahan_id_lahan" = $7, "Aktivitas_id_aktivitas" = $8 WHERE id_pengingat_jadwal = $9`,
		tTgl, pj.KategoriJadwal, pj.Deskripsi, pj.Interval, pj.StatusPencatatan, pj.Keterangan, pj.LahanIDLahan, pj.AktivitasIDAktivitas, pj.IDPengingatJadwal)
	return err
}

func (r *pengingatJadwalRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.pengingat_jadwal WHERE id_pengingat_jadwal = $1", id)
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

