package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pemupukan/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pemupukanRepository struct {
	db *pgxpool.Pool
}

func NewPemupukanRepository(db *pgxpool.Pool) domain.PemupukanRepository {
	return &pemupukanRepository{db: db}
}

func (r *pemupukanRepository) FindAll(ctx context.Context) ([]*domain.Pemupukan, error) {
	query := `
		SELECT p.id_pemupukan, p.nama_pupuk, p.dosis, p.satuan, p.deskripsi, p.manure_id, p.id_stok_pupuk,
		       p."Lahan_id_lahan", p."Aktivitas_id_aktivitas", p.created_at, p.updated_at
		FROM gardening.pemupukan p
		JOIN gardening.aktivitas a ON p."Aktivitas_id_aktivitas" = a.id_aktivitas
		ORDER BY a.tanggal_aktivitas DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Pemupukan
	for rows.Next() {
		p := &domain.Pemupukan{}
		if err := rows.Scan(&p.IDPemupukan, &p.NamaPupuk, &p.Dosis, &p.Satuan, &p.Deskripsi, &p.ManureID, &p.IDStokPupuk,
			&p.LahanIDLahan, &p.AktivitasIDAktivitas, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *pemupukanRepository) FindByID(ctx context.Context, id string) (*domain.Pemupukan, error) {
	p := &domain.Pemupukan{}
	query := `
		SELECT id_pemupukan, nama_pupuk, dosis, satuan, deskripsi, manure_id, id_stok_pupuk,
		       "Lahan_id_lahan", "Aktivitas_id_aktivitas", created_at, updated_at
		FROM gardening.pemupukan
		WHERE id_pemupukan = $1
	`
	err := r.db.QueryRow(ctx, query, id).
		Scan(&p.IDPemupukan, &p.NamaPupuk, &p.Dosis, &p.Satuan, &p.Deskripsi, &p.ManureID, &p.IDStokPupuk,
			&p.LahanIDLahan, &p.AktivitasIDAktivitas, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return p, nil
}

func (r *pemupukanRepository) Store(ctx context.Context, p *domain.Pemupukan) error {
	tgl := time.Now()

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
		tgl, "Pemupukan", "Pemupukan Organik", p.LahanIDLahan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	err = tx.QueryRow(ctx,
		`INSERT INTO gardening.pemupukan
		 (nama_pupuk, dosis, satuan, deskripsi, manure_id, id_stok_pupuk, "Lahan_id_lahan", "Aktivitas_id_aktivitas")
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id_pemupukan`,
		p.NamaPupuk, p.Dosis, p.Satuan, p.Deskripsi, p.ManureID, p.IDStokPupuk, p.LahanIDLahan, aktivitasID,
	).Scan(&p.IDPemupukan)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pemupukanRepository) Update(ctx context.Context, p *domain.Pemupukan) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var aktivitasID string
	err = tx.QueryRow(ctx,
		`SELECT "Aktivitas_id_aktivitas" FROM gardening.pemupukan WHERE id_pemupukan = $1`,
		p.IDPemupukan,
	).Scan(&aktivitasID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.aktivitas
		 SET Lahan_id_lahan = $1, updated_at = CURRENT_TIMESTAMP
		 WHERE id_aktivitas = $2`,
		p.LahanIDLahan, aktivitasID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`UPDATE gardening.pemupukan
		 SET nama_pupuk = $1, dosis = $2, satuan = $3, deskripsi = $4, manure_id = $5, id_stok_pupuk = $6, "Lahan_id_lahan" = $7, updated_at = CURRENT_TIMESTAMP
		 WHERE id_pemupukan = $8`,
		p.NamaPupuk, p.Dosis, p.Satuan, p.Deskripsi, p.ManureID, p.IDStokPupuk, p.LahanIDLahan, p.IDPemupukan,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *pemupukanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM gardening.aktivitas
		 WHERE id_aktivitas = (SELECT "Aktivitas_id_aktivitas" FROM gardening.pemupukan WHERE id_pemupukan = $1)`,
		id,
	)
	return err
}

