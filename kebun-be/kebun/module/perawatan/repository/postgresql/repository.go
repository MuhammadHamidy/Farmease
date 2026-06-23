package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/perawatan/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type perawatanRepository struct {
	db *pgxpool.Pool
}

func NewPerawatanRepository(db *pgxpool.Pool) domain.PerawatanRepository {
	return &perawatanRepository{db: db}
}

func (r *perawatanRepository) FindAll(ctx context.Context) ([]domain.Perawatan, error) {
	query := `
		SELECT id_perawatan, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		       jenis_bahan, fase_pohon, dosis, satuan, bagian_pohon, teknik_perawatan, nama_obat, deskripsi,
		       detail_pohon, Lahan_id_lahan
		FROM gardening.perawatan
		ORDER BY tanggal_aktivitas DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Perawatan
	for rows.Next() {
		var p domain.Perawatan
		var tgl time.Time
		if err := rows.Scan(&p.IDPerawatan, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.JenisBahan, &p.FasePohon, &p.Dosis, &p.Satuan, &p.BagianPohon, &p.TeknikPerawatan,
			&p.NamaObat, &p.Deskripsi, &p.DetailPohon, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
		list = append(list, p)
	}
	return list, nil
}

func (r *perawatanRepository) FindByID(ctx context.Context, id string) (*domain.Perawatan, error) {
	var p domain.Perawatan
	var tgl time.Time
	query := `
		SELECT id_perawatan, tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		       jenis_bahan, fase_pohon, dosis, satuan, bagian_pohon, teknik_perawatan, nama_obat, deskripsi,
		       detail_pohon, Lahan_id_lahan
		FROM gardening.perawatan
		WHERE id_perawatan = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPerawatan, &tgl, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas,
			&p.JenisBahan, &p.FasePohon, &p.Dosis, &p.Satuan, &p.BagianPohon, &p.TeknikPerawatan,
			&p.NamaObat, &p.Deskripsi, &p.DetailPohon, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.TanggalAktivitas = tgl.Format("2006-01-02 15:04:05")
	return &p, nil
}

func (r *perawatanRepository) Store(ctx context.Context, p *domain.Perawatan) error {
	tgl, err := parseTime(p.TanggalAktivitas)
	if err != nil {
		tgl = time.Now()
	}

	namaJenis := p.NamaJenisAktivitas
	if namaJenis == "" {
		namaJenis = "Perawatan"
	}

	return r.db.QueryRow(ctx,
		`INSERT INTO gardening.perawatan
		 (tanggal_aktivitas, nama_jenis_aktivitas, nama_rincian_aktivitas,
		  jenis_bahan, fase_pohon, dosis, satuan, bagian_pohon, teknik_perawatan,
		  nama_obat, deskripsi, detail_pohon, Lahan_id_lahan)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		 RETURNING id_perawatan`,
		tgl, namaJenis, p.NamaRincianAktivitas,
		p.JenisBahan, p.FasePohon, p.Dosis, p.Satuan, p.BagianPohon, p.TeknikPerawatan,
		p.NamaObat, p.Deskripsi, p.DetailPohon, p.LahanIDLahan,
	).Scan(&p.IDPerawatan)
}

func (r *perawatanRepository) Update(ctx context.Context, p *domain.Perawatan) error {
	tgl, err := parseTime(p.TanggalAktivitas)
	if err != nil {
		tgl = time.Now()
	}

	namaJenis := p.NamaJenisAktivitas
	if namaJenis == "" {
		namaJenis = "Perawatan"
	}

	_, err = r.db.Exec(ctx,
		`UPDATE gardening.perawatan
		 SET tanggal_aktivitas = $1, nama_jenis_aktivitas = $2, nama_rincian_aktivitas = $3,
		     jenis_bahan = $4, fase_pohon = $5, dosis = $6, satuan = $7,
		     bagian_pohon = $8, teknik_perawatan = $9, nama_obat = $10,
		     deskripsi = $11, detail_pohon = $12, Lahan_id_lahan = $13
		 WHERE id_perawatan = $14`,
		tgl, namaJenis, p.NamaRincianAktivitas,
		p.JenisBahan, p.FasePohon, p.Dosis, p.Satuan, p.BagianPohon, p.TeknikPerawatan,
		p.NamaObat, p.Deskripsi, p.DetailPohon, p.LahanIDLahan, p.IDPerawatan,
	)
	return err
}

func (r *perawatanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.perawatan WHERE id_perawatan = $1", id)
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
