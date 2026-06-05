package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/notifikasi/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type notifikasiRepository struct {
	db *pgxpool.Pool
}

func NewNotifikasiRepository(db *pgxpool.Pool) domain.NotifikasiRepository {
	return &notifikasiRepository{db: db}
}

func (r *notifikasiRepository) FindAll(ctx context.Context) ([]domain.Notifikasi, error) {
	rows, err := r.db.Query(ctx, "SELECT id_notifikasi, akun_id_akun, jadwal_rutin_id_jadwal_rutin, tipe_notifikasi, pesan, status_notifikasi, tanggal FROM gardening.notifikasi ORDER BY id_notifikasi ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Notifikasi
	for rows.Next() {
		var n domain.Notifikasi
		var tTgl time.Time
		if err := rows.Scan(&n.IDNotifikasi, &n.AkunIDAkun, &n.JadwalRutinIDJadwalRutin, &n.TipeNotifikasi, &n.Pesan, &n.StatusNotifikasi, &tTgl); err != nil {
			return nil, err
		}
		n.Tanggal = tTgl.Format("2006-01-02 15:04:05")
		list = append(list, n)
	}
	return list, nil
}

func (r *notifikasiRepository) FindByID(ctx context.Context, id int) (*domain.Notifikasi, error) {
	var n domain.Notifikasi
	var tTgl time.Time
	err := r.db.QueryRow(ctx, "SELECT id_notifikasi, akun_id_akun, jadwal_rutin_id_jadwal_rutin, tipe_notifikasi, pesan, status_notifikasi, tanggal FROM gardening.notifikasi WHERE id_notifikasi = $1", id).
		Scan(&n.IDNotifikasi, &n.AkunIDAkun, &n.JadwalRutinIDJadwalRutin, &n.TipeNotifikasi, &n.Pesan, &n.StatusNotifikasi, &tTgl)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	n.Tanggal = tTgl.Format("2006-01-02 15:04:05")
	return &n, nil
}

func (r *notifikasiRepository) Store(ctx context.Context, n *domain.Notifikasi) error {
	tTgl, err := parseTime(n.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	err = r.db.QueryRow(ctx, "INSERT INTO gardening.notifikasi (akun_id_akun, jadwal_rutin_id_jadwal_rutin, tipe_notifikasi, pesan, status_notifikasi, tanggal) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_notifikasi",
		n.AkunIDAkun, n.JadwalRutinIDJadwalRutin, n.TipeNotifikasi, n.Pesan, n.StatusNotifikasi, tTgl).Scan(&n.IDNotifikasi)
	return err
}

func (r *notifikasiRepository) Update(ctx context.Context, n *domain.Notifikasi) error {
	tTgl, err := parseTime(n.Tanggal)
	if err != nil {
		tTgl = time.Now()
	}
	_, err = r.db.Exec(ctx, "UPDATE gardening.notifikasi SET akun_id_akun = $1, jadwal_rutin_id_jadwal_rutin = $2, tipe_notifikasi = $3, pesan = $4, status_notifikasi = $5, tanggal = $6 WHERE id_notifikasi = $7",
		n.AkunIDAkun, n.JadwalRutinIDJadwalRutin, n.TipeNotifikasi, n.Pesan, n.StatusNotifikasi, tTgl, n.IDNotifikasi)
	return err
}

func (r *notifikasiRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.notifikasi WHERE id_notifikasi = $1", id)
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

