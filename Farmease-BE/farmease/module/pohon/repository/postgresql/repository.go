package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/pohon/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pohonRepository struct {
	db *pgxpool.Pool
}

func NewPohonRepository(db *pgxpool.Pool) domain.PohonRepository {
	return &pohonRepository{db: db}
}

func (r *pohonRepository) FindAll(ctx context.Context) ([]domain.Pohon, error) {
	rows, err := r.db.Query(ctx, "SELECT id_pohon, kode_pohon, tanggal_tanam, varietas, fase_pohon, Lahan_id_lahan FROM gardening.pohon ORDER BY id_pohon ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Pohon
	for rows.Next() {
		var p domain.Pohon
		var tTanam time.Time
		if err := rows.Scan(&p.IDPohon, &p.KodePohon, &tTanam, &p.Varietas, &p.FasePohon, &p.LahanIDLahan); err != nil {
			return nil, err
		}
		p.TanggalTanam = tTanam.Format("2006-01-02")
		list = append(list, p)
	}
	return list, nil
}

func (r *pohonRepository) FindByID(ctx context.Context, id int) (*domain.Pohon, error) {
	var p domain.Pohon
	var tTanam time.Time
	err := r.db.QueryRow(ctx, "SELECT id_pohon, kode_pohon, tanggal_tanam, varietas, fase_pohon, Lahan_id_lahan FROM gardening.pohon WHERE id_pohon = $1", id).
		Scan(&p.IDPohon, &p.KodePohon, &tTanam, &p.Varietas, &p.FasePohon, &p.LahanIDLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.TanggalTanam = tTanam.Format("2006-01-02")
	return &p, nil
}

func (r *pohonRepository) Store(ctx context.Context, p *domain.Pohon) error {
	tTanam, err := time.Parse("2006-01-02", p.TanggalTanam)
	if err != nil {
		tTanam = time.Now()
	}
	err = r.db.QueryRow(ctx, "INSERT INTO gardening.pohon (kode_pohon, tanggal_tanam, varietas, fase_pohon, Lahan_id_lahan) VALUES ($1, $2, $3, $4, $5) RETURNING id_pohon",
		p.KodePohon, tTanam, p.Varietas, p.FasePohon, p.LahanIDLahan).Scan(&p.IDPohon)
	return err
}

func (r *pohonRepository) Update(ctx context.Context, p *domain.Pohon) error {
	tTanam, err := time.Parse("2006-01-02", p.TanggalTanam)
	if err != nil {
		tTanam = time.Now()
	}
	_, err = r.db.Exec(ctx, "UPDATE gardening.pohon SET kode_pohon = $1, tanggal_tanam = $2, varietas = $3, fase_pohon = $4, Lahan_id_lahan = $5 WHERE id_pohon = $6",
		p.KodePohon, tTanam, p.Varietas, p.FasePohon, p.LahanIDLahan, p.IDPohon)
	return err
}

func (r *pohonRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.pohon WHERE id_pohon = $1", id)
	return err
}
