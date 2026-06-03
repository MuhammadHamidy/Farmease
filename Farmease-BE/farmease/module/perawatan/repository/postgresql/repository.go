package postgresql

import (
	"context"
	"errors"

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
		SELECT p.id_perawatan, p.Aktivitas_id_aktivitas, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.jenis_bahan, p.fase_pohon, p.dosis, p.satuan, p.bagian_pohon, p.teknik_perawatan, p.nama_obat, p.deskripsi, 
		       p.detail_pohon, p.Lahan_id_lahan 
		FROM gardening.perawatan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		ORDER BY p.id_perawatan ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Perawatan
	for rows.Next() {
		var p domain.Perawatan
		if err := rows.Scan(&p.IDPerawatan, &p.AktivitasIDAktivitas, &p.TanggalAktivitas, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas, &p.JenisBahan, &p.FasePohon, &p.Dosis, &p.Satuan, &p.BagianPohon, &p.TeknikPerawatan, &p.NamaObat, &p.Deskripsi, &p.DetailPohon, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *perawatanRepository) FindByID(ctx context.Context, id int) (*domain.Perawatan, error) {
	var p domain.Perawatan
	query := `
		SELECT p.id_perawatan, p.Aktivitas_id_aktivitas, a.tanggal_aktivitas, a.nama_jenis_aktivitas, a.nama_rincian_aktivitas,
		       p.jenis_bahan, p.fase_pohon, p.dosis, p.satuan, p.bagian_pohon, p.teknik_perawatan, p.nama_obat, p.deskripsi, 
		       p.detail_pohon, p.Lahan_id_lahan 
		FROM gardening.perawatan p
		JOIN gardening.aktivitas a ON p.Aktivitas_id_aktivitas = a.id_aktivitas
		WHERE p.id_perawatan = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPerawatan, &p.AktivitasIDAktivitas, &p.TanggalAktivitas, &p.NamaJenisAktivitas, &p.NamaRincianAktivitas, &p.JenisBahan, &p.FasePohon, &p.Dosis, &p.Satuan, &p.BagianPohon, &p.TeknikPerawatan, &p.NamaObat, &p.Deskripsi, &p.DetailPohon, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *perawatanRepository) Store(ctx context.Context, p *domain.Perawatan) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	err = tx.QueryRow(ctx, "INSERT INTO gardening.aktivitas (nama_jenis_aktivitas, nama_rincian_aktivitas, Lahan_id_lahan) VALUES ($1, $2, $3) RETURNING id_aktivitas",
		"Perawatan", p.NamaRincianAktivitas, p.LahanIDLahan).Scan(&p.AktivitasIDAktivitas)
	if err != nil {
		return err
	}

	err = tx.QueryRow(ctx, "INSERT INTO gardening.perawatan (Aktivitas_id_aktivitas, jenis_bahan, fase_pohon, dosis, satuan, bagian_pohon, teknik_perawatan, nama_obat, deskripsi, detail_pohon, Lahan_id_lahan) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id_perawatan",
		p.AktivitasIDAktivitas, p.JenisBahan, p.FasePohon, p.Dosis, p.Satuan, p.BagianPohon, p.TeknikPerawatan, p.NamaObat, p.Deskripsi, p.DetailPohon, p.LahanIDLahan).Scan(&p.IDPerawatan)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *perawatanRepository) Update(ctx context.Context, p *domain.Perawatan) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, "UPDATE gardening.aktivitas SET nama_rincian_aktivitas = $1 WHERE id_aktivitas = $2",
		p.NamaRincianAktivitas, p.AktivitasIDAktivitas)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, "UPDATE gardening.perawatan SET jenis_bahan = $1, fase_pohon = $2, dosis = $3, satuan = $4, bagian_pohon = $5, teknik_perawatan = $6, nama_obat = $7, deskripsi = $8, detail_pohon = $9, Lahan_id_lahan = $10 WHERE id_perawatan = $11",
		p.JenisBahan, p.FasePohon, p.Dosis, p.Satuan, p.BagianPohon, p.TeknikPerawatan, p.NamaObat, p.Deskripsi, p.DetailPohon, p.LahanIDLahan, p.IDPerawatan)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *perawatanRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.aktivitas WHERE id_aktivitas = (SELECT Aktivitas_id_aktivitas FROM gardening.perawatan WHERE id_perawatan = $1)", id)
	return err
}

