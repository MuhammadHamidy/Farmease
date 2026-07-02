package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/penanaman/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type penanamanRepository struct {
	db *pgxpool.Pool
}

func NewPenanamanRepository(db *pgxpool.Pool) domain.PenanamanRepository {
	return &penanamanRepository{db: db}
}

func (r *penanamanRepository) FindAll(ctx context.Context) ([]domain.Penanaman, error) {
	query := `
		SELECT p.id_penanaman, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.fase_pohon, p.varietas, p.deskripsi, p.Lahan_id_lahan
		FROM gardening.penanaman p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		ORDER BY a.tanggal_aktivitas DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Penanaman
	for rows.Next() {
		var p domain.Penanaman
		var tgl time.Time
		if err := rows.Scan(&p.IDPenanaman, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.FasePohon, &p.Varietas, &p.Deskripsi, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
		list = append(list, p)
	}
	return list, nil
}

func (r *penanamanRepository) FindByID(ctx context.Context, id string) (*domain.Penanaman, error) {
	var p domain.Penanaman
	var tgl time.Time
	query := `
		SELECT p.id_penanaman, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.fase_pohon, p.varietas, p.deskripsi, p.Lahan_id_lahan
		FROM gardening.penanaman p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		WHERE p.id_penanaman = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPenanaman, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.FasePohon, &p.Varietas, &p.Deskripsi, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
	return &p, nil
}

func (r *penanamanRepository) Store(ctx context.Context, p *domain.Penanaman) error {
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
		tgl, "Penanaman", p.NamaRincianAktivitas, p.LahanIDLahan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	err = tx.QueryRow(ctx,
		`INSERT INTO gardening.penanaman
		 (fase_pohon, varietas, deskripsi, Lahan_id_lahan, Aktivitas_id_aktivitas)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id_penanaman`,
		p.FasePohon, p.Varietas, p.Deskripsi, p.LahanIDLahan, aktivitasID,
	).Scan(&p.IDPenanaman)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *penanamanRepository) Update(ctx context.Context, p *domain.Penanaman) error {
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
		`SELECT Aktivitas_id_aktivitas FROM gardening.penanaman WHERE id_penanaman = $1`,
		p.IDPenanaman,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.aktivitas
		 SET tanggal_aktivitas = $1, nama_jenis_aktivitas = $2, nama_rincian_aktivitas = $3, Lahan_id_lahan = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id_aktivitas = $5`,
		tgl, "Penanaman", p.NamaRincianAktivitas, p.LahanIDLahan, aktivitasID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.penanaman
		 SET fase_pohon = $1, varietas = $2, deskripsi = $3, Lahan_id_lahan = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id_penanaman = $5`,
		p.FasePohon, p.Varietas, p.Deskripsi, p.LahanIDLahan, p.IDPenanaman,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *penanamanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM gardening.aktivitas
		 WHERE id_aktivitas = (SELECT Aktivitas_id_aktivitas FROM gardening.penanaman WHERE id_penanaman = $1)`,
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
