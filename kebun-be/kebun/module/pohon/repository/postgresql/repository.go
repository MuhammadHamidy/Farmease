package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pohon/domain"
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
	rows, err := r.db.Query(ctx, `SELECT id_pohon, kode_pohon, tanggal_tanam, varietas, fase_pohon, "Lahan_id_lahan", status_pohon FROM gardening.pohon ORDER BY id_pohon ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Pohon
	for rows.Next() {
		var p domain.Pohon
		var tTanam *time.Time
		if err := rows.Scan(&p.IDPohon, &p.KodePohon, &tTanam, &p.Varietas, &p.FasePohon, &p.LahanIDLahan, &p.StatusPohon); err != nil {
			return nil, err
		}
		if tTanam != nil {
			p.TanggalTanam = tTanam.Format("2006-01-02")
		} else {
			p.TanggalTanam = ""
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *pohonRepository) FindAllWithDetail(ctx context.Context) ([]domain.PohonDetail, error) {
	query := `
		SELECT p.id_pohon, p.kode_pohon, p.tanggal_tanam, p.varietas, p.fase_pohon, p."Lahan_id_lahan", p.status_pohon, l.jenis_tanaman 
		FROM gardening.pohon p
		JOIN gardening.lahan l ON p."Lahan_id_lahan" = l.id_lahan
		ORDER BY p.id_pohon ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.PohonDetail
	for rows.Next() {
		var p domain.PohonDetail
		var tTanam *time.Time
		if err := rows.Scan(&p.IDPohon, &p.KodePohon, &tTanam, &p.Varietas, &p.FasePohon, &p.LahanIDLahan, &p.StatusPohon, &p.JenisTanaman); err != nil {
			return nil, err
		}
		if tTanam != nil {
			p.TanggalTanam = tTanam.Format("2006-01-02")
		} else {
			p.TanggalTanam = ""
		}
		list = append(list, p)
	}
	return list, nil
}

func (r *pohonRepository) FindByID(ctx context.Context, id string) (*domain.Pohon, error) {
	var p domain.Pohon
	var tTanam *time.Time
	err := r.db.QueryRow(ctx, `SELECT id_pohon, kode_pohon, tanggal_tanam, varietas, fase_pohon, "Lahan_id_lahan", status_pohon FROM gardening.pohon WHERE id_pohon = $1`, id).
		Scan(&p.IDPohon, &p.KodePohon, &tTanam, &p.Varietas, &p.FasePohon, &p.LahanIDLahan, &p.StatusPohon)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if tTanam != nil {
		p.TanggalTanam = tTanam.Format("2006-01-02")
	} else {
		p.TanggalTanam = ""
	}
	return &p, nil
}

func (r *pohonRepository) Store(ctx context.Context, p *domain.Pohon) error {
	tTanam, err := parseTime(p.TanggalTanam)
	if err != nil {
		tTanam = time.Now()
	}
	statusPohon := p.StatusPohon
	if statusPohon == "" {
		statusPohon = "aktif"
	}
	err = r.db.QueryRow(ctx, `INSERT INTO gardening.pohon (kode_pohon, tanggal_tanam, varietas, fase_pohon, "Lahan_id_lahan", status_pohon) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_pohon`,
		p.KodePohon, tTanam, p.Varietas, p.FasePohon, p.LahanIDLahan, statusPohon).Scan(&p.IDPohon)
	return err
}

func (r *pohonRepository) Update(ctx context.Context, p *domain.Pohon) error {
	tTanam, err := parseTime(p.TanggalTanam)
	if err != nil {
		tTanam = time.Now()
	}
	statusPohon := p.StatusPohon
	if statusPohon == "" {
		statusPohon = "aktif"
	}
	_, err = r.db.Exec(ctx, `UPDATE gardening.pohon SET kode_pohon = $1, tanggal_tanam = $2, varietas = $3, fase_pohon = $4, "Lahan_id_lahan" = $5, status_pohon = $6, updated_at = CURRENT_TIMESTAMP WHERE id_pohon = $7`,
		p.KodePohon, tTanam, p.Varietas, p.FasePohon, p.LahanIDLahan, statusPohon, p.IDPohon)
	return err
}

func (r *pohonRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM gardening.pohon WHERE id_pohon = $1", id)
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

