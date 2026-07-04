package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pemangkasan/domain"
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
		SELECT p.id_pemangkasan, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.jumlah, p.satuan, p.keterangan, p.Lahan_id_lahan
		FROM gardening.pemangkasan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		ORDER BY a.tanggal_aktivitas DESC
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
		SELECT p.id_pemangkasan, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.jumlah, p.satuan, p.keterangan, p.Lahan_id_lahan
		FROM gardening.pemangkasan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		WHERE p.id_pemangkasan = $1
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

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var aktivitasID string
	err = tx.QueryRow(ctx,
		`INSERT INTO gardening.aktivitas (tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id_aktivitas`,
		tPem, "Pemangkasan", p.NamaRincianAktivitas, p.LahanIDLahan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	err = tx.QueryRow(ctx,
		`INSERT INTO gardening.pemangkasan
		 (jumlah, satuan, keterangan, Lahan_id_lahan, Aktivitas_id_aktivitas)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id_pemangkasan`,
		p.Jumlah, p.Satuan, p.Keterangan, p.LahanIDLahan, aktivitasID,
	).Scan(&p.IDPemangkasan)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pemangkasanRepository) Update(ctx context.Context, p *domain.Pemangkasan) error {
	tPem, err := parseTime(p.TanggalAktivitas)
	if err != nil {
		tPem = time.Now()
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var aktivitasID string
	err = tx.QueryRow(ctx,
		`SELECT Aktivitas_id_aktivitas FROM gardening.pemangkasan WHERE id_pemangkasan = $1`,
		p.IDPemangkasan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.aktivitas
		 SET tanggal_aktivitas = $1, nama_jenis_aktivitas = $2, nama_rincian_aktivitas = $3, Lahan_id_lahan = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id_aktivitas = $5`,
		tPem, "Pemangkasan", p.NamaRincianAktivitas, p.LahanIDLahan, aktivitasID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.pemangkasan
		 SET jumlah = $1, satuan = $2, keterangan = $3, Lahan_id_lahan = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id_pemangkasan = $5`,
		p.Jumlah, p.Satuan, p.Keterangan, p.LahanIDLahan, p.IDPemangkasan,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pemangkasanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM gardening.aktivitas
		 WHERE id_aktivitas = (SELECT Aktivitas_id_aktivitas FROM gardening.pemangkasan WHERE id_pemangkasan = $1)`,
		id,
	)
	return err
}

func parseTime(val string) (time.Time, error) {
	layouts := []string{
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02T15:04:05.999Z",
		"2006-01-02T15:04:05.999Z07:00",
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05Z",
		"2006-01-02",
		"02-01-2006",
		"02/01/2006",
		"2006/01/02",
		time.RFC3339,
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, val); err == nil {
			return t, nil
		}
	}
	return time.Time{}, errors.New("invalid time format")
}

