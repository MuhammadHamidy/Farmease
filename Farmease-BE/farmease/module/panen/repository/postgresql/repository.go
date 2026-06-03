package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/panen/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type panenRepository struct {
	db *pgxpool.Pool
}

func NewPanenRepository(db *pgxpool.Pool) domain.PanenRepository {
	return &panenRepository{db: db}
}

func (r *panenRepository) FindAll(ctx context.Context) ([]domain.Panen, error) {
	query := `
		SELECT p.id_panen, p.Aktivitas_id_aktivitas, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.jumlah, p.satuan, p.Lahan_id_lahan 
		FROM gardening.panen p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		ORDER BY p.id_panen ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Panen
	for rows.Next() {
		var p domain.Panen
		var tTgl time.Time
		if err := rows.Scan(&p.IDPanen, &p.AktivitasIDAktivitas, &tTgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas, &p.Jumlah, &p.Satuan, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalAktivitas = tTgl.Format("2006-01-02")
		list = append(list, p)
	}
	return list, nil
}

func (r *panenRepository) FindByID(ctx context.Context, id int) (*domain.Panen, error) {
	var p domain.Panen
	var tTgl time.Time
	query := `
		SELECT p.id_panen, p.Aktivitas_id_aktivitas, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.jumlah, p.satuan, p.Lahan_id_lahan 
		FROM gardening.panen p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		WHERE p.id_panen = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPanen, &p.AktivitasIDAktivitas, &tTgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas, &p.Jumlah, &p.Satuan, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.TanggalAktivitas = tTgl.Format("2006-01-02")
	return &p, nil
}

func (r *panenRepository) FindRekap(ctx context.Context) ([]domain.PanenRekap, error) {
	query := `
		SELECT EXTRACT(YEAR FROM a.tanggal_aktivitas)::INT as tahun, SUM(p.jumlah)::INT as total_jumlah, p.satuan 
		FROM gardening.panen p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		GROUP BY tahun, p.satuan 
		ORDER BY tahun DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.PanenRekap
	for rows.Next() {
		var rk domain.PanenRekap
		if err := rows.Scan(&rk.Tahun, &rk.TotalJumlah, &rk.Satuan); err != nil {
			return nil, err
		}
		list = append(list, rk)
	}
	return list, nil
}

func (r *panenRepository) Store(ctx context.Context, p *domain.Panen) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	tTgl, err := time.Parse("2006-01-02", p.TanggalAktivitas)
	if err != nil {
		tTgl = time.Now()
	}

	err = tx.QueryRow(ctx, "INSERT INTO gardening.aktivitas (tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES ($1, $2, $3, $4) RETURNING id_aktivitas",
		tTgl, "Panen", p.NamaRincianAktivitas, p.LahanIDLahan).Scan(&p.AktivitasIDAktivitas)
	if err != nil {
		return err
	}

	err = tx.QueryRow(ctx, "INSERT INTO gardening.panen (Aktivitas_id_aktivitas, jumlah, satuan, Lahan_id_lahan) VALUES ($1, $2, $3, $4) RETURNING id_panen",
		p.AktivitasIDAktivitas, p.Jumlah, p.Satuan, p.LahanIDLahan).Scan(&p.IDPanen)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *panenRepository) Update(ctx context.Context, p *domain.Panen) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	tTgl, err := time.Parse("2006-01-02", p.TanggalAktivitas)
	if err != nil {
		tTgl = time.Now()
	}

	_, err = tx.Exec(ctx, "UPDATE gardening.aktivitas SET tanggal_aktivitas = $1, nama_rincian_aktivitas = $2 WHERE id_aktivitas = $3",
		tTgl, p.NamaRincianAktivitas, p.AktivitasIDAktivitas)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, "UPDATE gardening.panen SET jumlah = $1, satuan = $2, Lahan_id_lahan = $3 WHERE id_panen = $4",
		p.Jumlah, p.Satuan, p.LahanIDLahan, p.IDPanen)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *panenRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.aktivitas WHERE id_aktivitas = (SELECT Aktivitas_id_aktivitas FROM gardening.panen WHERE id_panen = $1)", id)
	return err
}

