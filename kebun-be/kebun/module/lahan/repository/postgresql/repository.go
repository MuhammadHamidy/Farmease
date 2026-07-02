package postgresql

import (
	"context"
	"errors"

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
	rows, err := r.db.Query(ctx, "SELECT id_lahan, kode_lahan, nama_lahan, status_lahan, jenis_tanaman, luas_lahan FROM gardening.lahan ORDER BY id_lahan ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lands []domain.Lahan
	for rows.Next() {
		var l domain.Lahan
		if err := rows.Scan(&l.IDLahan, &l.KodeLahan, &l.NamaLahan, &l.StatusLahan, &l.JenisTanaman, &l.LuasLahan); err != nil {
			return nil, err
		}
		l.Varietas = ""
		l.KapasitasMaksimal = 50
		l.TanggalTanam = ""
		l.FaseTanam = ""
		lands = append(lands, l)
	}
	return lands, nil
}

func (r *lahanRepository) FindByID(ctx context.Context, id string) (*domain.Lahan, error) {
	var l domain.Lahan
	err := r.db.QueryRow(ctx, "SELECT id_lahan, kode_lahan, nama_lahan, status_lahan, jenis_tanaman, luas_lahan FROM gardening.lahan WHERE id_lahan = $1", id).
		Scan(&l.IDLahan, &l.KodeLahan, &l.NamaLahan, &l.StatusLahan, &l.JenisTanaman, &l.LuasLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	l.Varietas = ""
	l.KapasitasMaksimal = 50
	l.TanggalTanam = ""
	l.FaseTanam = ""
	return &l, nil
}

func (r *lahanRepository) Store(ctx context.Context, l *domain.Lahan) error {
	err := r.db.QueryRow(ctx, "INSERT INTO gardening.lahan (kode_lahan, nama_lahan, status_lahan, jenis_tanaman, luas_lahan) VALUES ($1, $2, $3, $4, $5) RETURNING id_lahan",
		l.KodeLahan, l.NamaLahan, l.StatusLahan, l.JenisTanaman, l.LuasLahan).Scan(&l.IDLahan)
	return err
}

func (r *lahanRepository) Update(ctx context.Context, l *domain.Lahan) error {
	_, err := r.db.Exec(ctx, "UPDATE gardening.lahan SET kode_lahan = $1, nama_lahan = $2, status_lahan = $3, jenis_tanaman = $4, luas_lahan = $5, updated_at = CURRENT_TIMESTAMP WHERE id_lahan = $6",
		l.KodeLahan, l.NamaLahan, l.StatusLahan, l.JenisTanaman, l.LuasLahan, l.IDLahan)
	return err
}

func (r *lahanRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.lahan WHERE id_lahan = $1", id)
	return err
}

func (r *lahanRepository) FindByKodeLahan(ctx context.Context, kode string) (*domain.Lahan, error) {
	var l domain.Lahan
	err := r.db.QueryRow(ctx, "SELECT id_lahan, kode_lahan, nama_lahan, status_lahan, jenis_tanaman, luas_lahan FROM gardening.lahan WHERE kode_lahan = $1", kode).
		Scan(&l.IDLahan, &l.KodeLahan, &l.NamaLahan, &l.StatusLahan, &l.JenisTanaman, &l.LuasLahan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	l.Varietas = ""
	l.KapasitasMaksimal = 50
	l.TanggalTanam = ""
	return &l, nil
}
