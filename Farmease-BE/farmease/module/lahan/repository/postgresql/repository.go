package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/lahan/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type lahanRepository struct {
	db *pgxpool.Pool
}

func NewLahanRepository(db *pgxpool.Pool) domain.LahanRepository {
	return &lahanRepository{db: db}
}

func (r *lahanRepository) FindAll(ctx context.Context) ([]domain.Lahan, error) {
	rows, err := r.db.Query(ctx, "SELECT id_lahan, kode_lahan, status_lahan, varietas, tanggal_tanam, fase_tanam FROM gardening.lahan ORDER BY id_lahan ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lands []domain.Lahan
	for rows.Next() {
		var l domain.Lahan
		var tTgl time.Time
		if err := rows.Scan(&l.IDLahan, &l.KodeLahan, &l.StatusLahan, &l.Varietas, &tTgl, &l.FaseTanam); err != nil {
			return nil, err
		}
		l.TanggalTanam = tTgl.Format("2006-01-02")
		lands = append(lands, l)
	}
	return lands, nil
}

func (r *lahanRepository) FindByID(ctx context.Context, id int) (*domain.Lahan, error) {
	var l domain.Lahan
	var tTgl time.Time
	err := r.db.QueryRow(ctx, "SELECT id_lahan, kode_lahan, status_lahan, varietas, tanggal_tanam, fase_tanam FROM gardening.lahan WHERE id_lahan = $1", id).
		Scan(&l.IDLahan, &l.KodeLahan, &l.StatusLahan, &l.Varietas, &tTgl, &l.FaseTanam)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	l.TanggalTanam = tTgl.Format("2006-01-02")
	return &l, nil
}

func (r *lahanRepository) Store(ctx context.Context, l *domain.Lahan) error {
	tTgl, err := time.Parse("2006-01-02", l.TanggalTanam)
	if err != nil {
		tTgl = time.Now()
	}
	err = r.db.QueryRow(ctx, "INSERT INTO gardening.lahan (kode_lahan, status_lahan, varietas, tanggal_tanam, fase_tanam) VALUES ($1, $2, $3, $4, $5) RETURNING id_lahan",
		l.KodeLahan, l.StatusLahan, l.Varietas, tTgl, l.FaseTanam).Scan(&l.IDLahan)
	return err
}

func (r *lahanRepository) Update(ctx context.Context, l *domain.Lahan) error {
	tTgl, err := time.Parse("2006-01-02", l.TanggalTanam)
	if err != nil {
		tTgl = time.Now()
	}
	_, err = r.db.Exec(ctx, "UPDATE gardening.lahan SET kode_lahan = $1, status_lahan = $2, varietas = $3, tanggal_tanam = $4, fase_tanam = $5 WHERE id_lahan = $6",
		l.KodeLahan, l.StatusLahan, l.Varietas, tTgl, l.FaseTanam, l.IDLahan)
	return err
}

func (r *lahanRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.lahan WHERE id_lahan = $1", id)
	return err
}

func (r *lahanRepository) FindByKodeLahan(ctx context.Context, kode string) (*domain.Lahan, error) {
	var l domain.Lahan
	var tTgl time.Time
	err := r.db.QueryRow(ctx, "SELECT id_lahan, kode_lahan, status_lahan, varietas, tanggal_tanam, fase_tanam FROM gardening.lahan WHERE kode_lahan = $1", kode).
		Scan(&l.IDLahan, &l.KodeLahan, &l.StatusLahan, &l.Varietas, &tTgl, &l.FaseTanam)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	l.TanggalTanam = tTgl.Format("2006-01-02")
	return &l, nil
}

