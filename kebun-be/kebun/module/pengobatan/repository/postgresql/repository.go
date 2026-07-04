package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pengobatan/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pengobatanRepository struct {
	db *pgxpool.Pool
}

func NewPengobatanRepository(db *pgxpool.Pool) domain.PengobatanRepository {
	return &pengobatanRepository{db: db}
}

func (r *pengobatanRepository) FindAll(ctx context.Context) ([]domain.Pengobatan, error) {
	query := `
		SELECT p.id_pengobatan, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.nama_obat, p.dosis, p.satuan, p.bagian_pohon, p.deskripsi, p.Lahan_id_lahan
		FROM gardening.pengobatan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		ORDER BY a.tanggal_aktivitas DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Pengobatan
	for rows.Next() {
		var p domain.Pengobatan
		var tgl time.Time
		if err := rows.Scan(&p.IDPengobatan, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.NamaObat, &p.Dosis, &p.Satuan, &p.BagianPohon, &p.Deskripsi, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
		list = append(list, p)
	}
	return list, nil
}

func (r *pengobatanRepository) FindByID(ctx context.Context, id string) (*domain.Pengobatan, error) {
	var p domain.Pengobatan
	var tgl time.Time
	query := `
		SELECT p.id_pengobatan, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.nama_obat, p.dosis, p.satuan, p.bagian_pohon, p.deskripsi, p.Lahan_id_lahan
		FROM gardening.pengobatan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		WHERE p.id_pengobatan = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPengobatan, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.NamaObat, &p.Dosis, &p.Satuan, &p.BagianPohon, &p.Deskripsi, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
	return &p, nil
}

func (r *pengobatanRepository) Store(ctx context.Context, p *domain.Pengobatan) error {
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
		tgl, "Pemberian Obat", p.NamaRincianAktivitas, p.LahanIDLahan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	err = tx.QueryRow(ctx,
		`INSERT INTO gardening.pengobatan
		 (nama_obat, dosis, satuan, bagian_pohon, deskripsi, Lahan_id_lahan, Aktivitas_id_aktivitas)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id_pengobatan`,
		p.NamaObat, p.Dosis, p.Satuan, p.BagianPohon, p.Deskripsi, p.LahanIDLahan, aktivitasID,
	).Scan(&p.IDPengobatan)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pengobatanRepository) Update(ctx context.Context, p *domain.Pengobatan) error {
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
		`SELECT Aktivitas_id_aktivitas FROM gardening.pengobatan WHERE id_pengobatan = $1`,
		p.IDPengobatan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.aktivitas
		 SET tanggal_aktivitas = $1, nama_jenis_aktivitas = $2, nama_rincian_aktivitas = $3, Lahan_id_lahan = $4, updated_at = CURRENT_TIMESTAMP
		 WHERE id_aktivitas = $5`,
		tgl, "Pemberian Obat", p.NamaRincianAktivitas, p.LahanIDLahan, aktivitasID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.pengobatan
		 SET nama_obat = $1, dosis = $2, satuan = $3, bagian_pohon = $4, deskripsi = $5, Lahan_id_lahan = $6, updated_at = CURRENT_TIMESTAMP
		 WHERE id_pengobatan = $7`,
		p.NamaObat, p.Dosis, p.Satuan, p.BagianPohon, p.Deskripsi, p.LahanIDLahan, p.IDPengobatan,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pengobatanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM gardening.aktivitas
		 WHERE id_aktivitas = (SELECT Aktivitas_id_aktivitas FROM gardening.pengobatan WHERE id_pengobatan = $1)`,
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

