package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/pembuahan/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pembuahanRepository struct {
	db *pgxpool.Pool
}

func NewPembuahanRepository(db *pgxpool.Pool) domain.PembuahanRepository {
	return &pembuahanRepository{db: db}
}

func (r *pembuahanRepository) FindAll(ctx context.Context) ([]domain.Pembuahan, error) {
	query := `
		SELECT p.id_pembuahan, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.fase_pohon, p.teknik_pembuahan, p.deskripsi, p.Lahan_id_lahan
		FROM gardening.pembuahan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		ORDER BY a.tanggal_aktivitas DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Pembuahan
	for rows.Next() {
		var p domain.Pembuahan
		var tgl time.Time
		if err := rows.Scan(&p.IDPembuahan, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.FasePohon, &p.TeknikPembuahan, &p.Deskripsi, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
		list = append(list, p)
	}
	return list, nil
}

func (r *pembuahanRepository) FindByID(ctx context.Context, id string) (*domain.Pembuahan, error) {
	var p domain.Pembuahan
	var tgl time.Time
	query := `
		SELECT p.id_pembuahan, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.fase_pohon, p.teknik_pembuahan, p.deskripsi, p.Lahan_id_lahan
		FROM gardening.pembuahan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		WHERE p.id_pembuahan = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPembuahan, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.FasePohon, &p.TeknikPembuahan, &p.Deskripsi, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
	return &p, nil
}

func (r *pembuahanRepository) Store(ctx context.Context, p *domain.Pembuahan) error {
	tgl, err := parseTime(p.TanggalAktivitas)
	if err != nil {
		tgl = time.Now()
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
		tgl, "Pembuahan", p.NamaRincianAktivitas, p.LahanIDLahan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	err = tx.QueryRow(ctx,
		`INSERT INTO gardening.pembuahan
		 (fase_pohon, teknik_pembuahan, deskripsi, Lahan_id_lahan, Aktivitas_id_aktivitas)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id_pembuahan`,
		p.FasePohon, p.TeknikPembuahan, p.Deskripsi, p.LahanIDLahan, aktivitasID,
	).Scan(&p.IDPembuahan)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pembuahanRepository) Update(ctx context.Context, p *domain.Pembuahan) error {
	tgl, err := parseTime(p.TanggalAktivitas)
	if err != nil {
		tgl = time.Now()
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var aktivitasID string
	err = tx.QueryRow(ctx,
		`SELECT Aktivitas_id_aktivitas FROM gardening.pembuahan WHERE id_pembuahan = $1`,
		p.IDPembuahan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.aktivitas
		 SET tanggal_aktivitas = $1, nama_jenis_aktivitas = $2, nama_rincian_aktivitas = $3, Lahan_id_lahan = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id_aktivitas = $5`,
		tgl, "Pembuahan", p.NamaRincianAktivitas, p.LahanIDLahan, aktivitasID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.pembuahan
		 SET fase_pohon = $1, teknik_pembuahan = $2, deskripsi = $3, Lahan_id_lahan = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id_pembuahan = $5`,
		p.FasePohon, p.TeknikPembuahan, p.Deskripsi, p.LahanIDLahan, p.IDPembuahan,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pembuahanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM gardening.aktivitas
		 WHERE id_aktivitas = (SELECT Aktivitas_id_aktivitas FROM gardening.pembuahan WHERE id_pembuahan = $1)`,
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
