package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/farmease-be/farmease/module/akun_lahan/domain"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type akunLahanRepository struct {
	db *pgxpool.Pool
}

func NewAkunLahanRepository(db *pgxpool.Pool) domain.AkunLahanRepository {
	return &akunLahanRepository{db: db}
}

func (r *akunLahanRepository) FindAll(ctx context.Context) ([]domain.AkunLahan, error) {
	rows, err := r.db.Query(ctx, "SELECT id_akun_lahan, tanggal_tanam, status, Lahan_id_lahan, Akun_id_akun FROM gardening.akun_lahan ORDER BY id_akun_lahan ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.AkunLahan
	for rows.Next() {
		var al domain.AkunLahan
		var tTgl time.Time
		if err := rows.Scan(&al.IDAkunLahan, &tTgl, &al.Status, &al.LahanIDLahan, &al.AkunIDAkun); err != nil {
			return nil, err
		}
		al.TanggalTanam = tTgl.Format("2006-01-02 15:04:05")
		list = append(list, al)
	}
	return list, nil
}

func (r *akunLahanRepository) FindByID(ctx context.Context, id int) (*domain.AkunLahan, error) {
	var al domain.AkunLahan
	var tTgl time.Time
	err := r.db.QueryRow(ctx, "SELECT id_akun_lahan, tanggal_tanam, status, Lahan_id_lahan, Akun_id_akun FROM gardening.akun_lahan WHERE id_akun_lahan = $1", id).
		Scan(&al.IDAkunLahan, &tTgl, &al.Status, &al.LahanIDLahan, &al.AkunIDAkun)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	al.TanggalTanam = tTgl.Format("2006-01-02 15:04:05")
	return &al, nil
}

func (r *akunLahanRepository) Store(ctx context.Context, al *domain.AkunLahan) error {
	tTgl, err := parseTime(al.TanggalTanam)
	if err != nil {
		tTgl = time.Now()
	}
	err = r.db.QueryRow(ctx, "INSERT INTO gardening.akun_lahan (tanggal_tanam, status, Lahan_id_lahan, Akun_id_akun) VALUES ($1, $2, $3, $4) RETURNING id_akun_lahan",
		tTgl, al.Status, al.LahanIDLahan, al.AkunIDAkun).Scan(&al.IDAkunLahan)
	return err
}

func (r *akunLahanRepository) Update(ctx context.Context, al *domain.AkunLahan) error {
	tTgl, err := parseTime(al.TanggalTanam)
	if err != nil {
		tTgl = time.Now()
	}
	_, err = r.db.Exec(ctx, "UPDATE gardening.akun_lahan SET tanggal_tanam = $1, status = $2, Lahan_id_lahan = $3, Akun_id_akun = $4 WHERE id_akun_lahan = $5",
		tTgl, al.Status, al.LahanIDLahan, al.AkunIDAkun, al.IDAkunLahan)
	return err
}

func (r *akunLahanRepository) Delete(ctx context.Context, id int) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.akun_lahan WHERE id_akun_lahan = $1", id)
	return err
}

func parseTime(val string) (time.Time, error) {
	if t, err := time.Parse("2006-01-02 15:04:05", val); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02T15:04:05Z", val); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02", val); err == nil {
		return t, nil
	}
	return time.Time{}, errors.New("invalid time format")
}

