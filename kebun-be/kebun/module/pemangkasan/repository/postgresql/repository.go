package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/pemangkasan/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pemangkasanRepository struct {
	db *pgxpool.Pool
}

func NewPemangkasanRepository(db *pgxpool.Pool) domain.PemangkasanRepository {
	return &pemangkasanRepository{db: db}
}

func (r *pemangkasanRepository) FindAll(ctx context.Context) ([]domain.Pemangkasan, error) {
	query := `
		SELECT id_pemangkasan, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		       jumlah, satuan, keterangan, Lahan_id_lahan
		FROM gardening.pemangkasan
		ORDER BY tanggal_aktivitas DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Pemangkasan
	for rows.Next() {
		var p domain.Pemangkasan
		var tPem time.Time
		if err := rows.Scan(&p.IDPemangkasan, &tPem, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.Jumlah, &p.Satuan, &p.Keterangan, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalAktivitas = tPem.Format("2006-01-02 15:04:05")
		list = append(list, p)
	}
	return list, nil
}

func (r *pemangkasanRepository) FindByID(ctx context.Context, id string) (*domain.Pemangkasan, error) {
	var p domain.Pemangkasan
	var tPem time.Time
	query := `
		SELECT id_pemangkasan, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		       jumlah, satuan, keterangan, Lahan_id_lahan
		FROM gardening.pemangkasan
		WHERE id_pemangkasan = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPemangkasan, &tPem, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.Jumlah, &p.Satuan, &p.Keterangan, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.TanggalAktivitas = tPem.Format("2006-01-02 15:04:05")
	return &p, nil
}

func (r *pemangkasanRepository) Store(ctx context.Context, p *domain.Pemangkasan) error {
	tPem, err := parseTime(p.TanggalAktivitas)
	if err != nil {
		tPem = time.Now()
	}

	return r.db.QueryRow(ctx,
		`INSERT INTO gardening.pemangkasan
		 (tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		  jumlah, satuan, keterangan, Lahan_id_lahan)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id_pemangkasan`,
		tPem, "Pemangkasan", p.NamaRincianAktivitas,
		p.Jumlah, p.Satuan, p.Keterangan, p.LahanIDLahan,
	).Scan(&p.IDPemangkasan)
}

func (r *pemangkasanRepository) Update(ctx context.Context, p *domain.Pemangkasan) error {
	tPem, err := parseTime(p.TanggalAktivitas)
	if err != nil {
		tPem = time.Now()
	}

	_, err = r.db.Exec(ctx,
		`UPDATE gardening.pemangkasan
		 SET tanggal_aktivitas = $1, nama_rincian_aktivitas = $2,
		     jumlah = $3, satuan = $4, keterangan = $5, Lahan_id_lahan = $6
		 WHERE id_pemangkasan = $7`,
		tPem, p.NamaRincianAktivitas,
		p.Jumlah, p.Satuan, p.Keterangan, p.LahanIDLahan, p.IDPemangkasan,
	)
	return err
}

func (r *pemangkasanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.pemangkasan WHERE id_pemangkasan = $1", id)
	return err
}

func parseTime(val string) (time.Time, error) {
	for _, layout := range []string{"2006-01-02 15:04:05", "2006-01-02T15:04:05Z", "2006-01-02"} {
		if t, err := time.Parse(layout, val); err == nil {
			return t, nil
		}
	}
	return time.Time{}, errors.New("invalid time format")
}
