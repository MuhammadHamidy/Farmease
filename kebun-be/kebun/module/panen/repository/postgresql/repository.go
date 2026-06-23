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
		SELECT id_panen, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		       jumlah, satuan, Lahan_id_lahan
		FROM gardening.panen
		ORDER BY tanggal_aktivitas DESC
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
		if err := rows.Scan(&p.IDPanen, &tTgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.Jumlah, &p.Satuan, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalAktivitas = tTgl.Format("2006-01-02")
		list = append(list, p)
	}
	return list, nil
}

func (r *panenRepository) FindByID(ctx context.Context, id string) (*domain.Panen, error) {
	var p domain.Panen
	var tTgl time.Time
	query := `
		SELECT id_panen, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		       jumlah, satuan, Lahan_id_lahan
		FROM gardening.panen
		WHERE id_panen = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPanen, &tTgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.Jumlah, &p.Satuan, &p.LahanIDLahan)
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
		SELECT EXTRACT(YEAR FROM tanggal_aktivitas)::INT AS tahun,
		       SUM(jumlah)::INT AS total_jumlah,
		       satuan
		FROM gardening.panen
		GROUP BY tahun, satuan
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
	tTgl, err := time.Parse("2006-01-02", p.TanggalAktivitas)
	if err != nil {
		tTgl = time.Now()
	}

	return r.db.QueryRow(ctx,
		`INSERT INTO gardening.panen
		 (tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas, jumlah, satuan, Lahan_id_lahan)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id_panen`,
		tTgl, "Panen", p.NamaRincianAktivitas,
		p.Jumlah, p.Satuan, p.LahanIDLahan,
	).Scan(&p.IDPanen)
}

func (r *panenRepository) Update(ctx context.Context, p *domain.Panen) error {
	tTgl, err := time.Parse("2006-01-02", p.TanggalAktivitas)
	if err != nil {
		tTgl = time.Now()
	}

	_, err = r.db.Exec(ctx,
		`UPDATE gardening.panen
		 SET tanggal_aktivitas = $1, nama_rincian_aktivitas = $2,
		     jumlah = $3, satuan = $4, Lahan_id_lahan = $5
		 WHERE id_panen = $6`,
		tTgl, p.NamaRincianAktivitas,
		p.Jumlah, p.Satuan, p.LahanIDLahan, p.IDPanen,
	)
	return err
}

func (r *panenRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.panen WHERE id_panen = $1", id)
	return err
}
