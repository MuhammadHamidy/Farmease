package postgresql

import (
	"context"
	"errors"
	"time"

	"github.com/farmease/kebun-be/kebun/module/fermentasi/domain"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type fermentasiRepository struct {
	db *pgxpool.Pool
}

func NewFermentasiRepository(db *pgxpool.Pool) domain.FermentasiRepository {
	return &fermentasiRepository{db: db}
}

func (r *fermentasiRepository) FindAll(ctx context.Context) ([]*domain.Fermentasi, error) {
	query := `
		SELECT id_fermentasi, tanggal_mulai, status, notes, id_account, created_at, updated_at,
		       target_pupuk_name, target_jumlah, satuan, id_stok_bahan
		FROM gardening.fermentasi_pupuk
		ORDER BY tanggal_mulai DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Fermentasi
	for rows.Next() {
		f := &domain.Fermentasi{}
		fp := &domain.FermentasiPupuk{}
		var tgl time.Time
		err := rows.Scan(
			&f.IDFermentasi, &tgl, &f.Status, &f.Notes, &f.IDAccount, &f.CreatedAt, &f.UpdatedAt,
			&fp.TargetPupukName, &fp.TargetJumlah, &fp.Satuan, &fp.IDStokBahan,
		)
		if err != nil {
			return nil, err
		}
		f.TanggalMulai = tgl
		fp.IDFermentasiPupuk = f.IDFermentasi
		f.PupukDetails = fp
		list = append(list, f)
	}
	return list, nil
}

func (r *fermentasiRepository) FindByID(ctx context.Context, id string) (*domain.Fermentasi, error) {
	f := &domain.Fermentasi{}
	fp := &domain.FermentasiPupuk{}
	var tgl time.Time
	query := `
		SELECT id_fermentasi, tanggal_mulai, status, notes, id_account, created_at, updated_at,
		       target_pupuk_name, target_jumlah, satuan, id_stok_bahan
		FROM gardening.fermentasi_pupuk
		WHERE id_fermentasi = $1
	`
	err := r.db.QueryRow(ctx, query, id).Scan(
		&f.IDFermentasi, &tgl, &f.Status, &f.Notes, &f.IDAccount, &f.CreatedAt, &f.UpdatedAt,
		&fp.TargetPupukName, &fp.TargetJumlah, &fp.Satuan, &fp.IDStokBahan,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	f.TanggalMulai = tgl
	fp.IDFermentasiPupuk = f.IDFermentasi
	f.PupukDetails = fp

	// Load logs
	logs, err := r.FindLogsByFermentasiID(ctx, id)
	if err == nil {
		f.Logs = logs
	}

	return f, nil
}

func (r *fermentasiRepository) Store(ctx context.Context, f *domain.Fermentasi) error {
	f.TanggalMulai = time.Now()
	
	var targetName string
	var targetJumlah float64
	var satuan string
	var idStokBahan *string

	if f.PupukDetails != nil {
		targetName = f.PupukDetails.TargetPupukName
		targetJumlah = f.PupukDetails.TargetJumlah
		satuan = f.PupukDetails.Satuan
		idStokBahan = f.PupukDetails.IDStokBahan
		if idStokBahan != nil {
			val := *idStokBahan
			if val == "" || val == "undefined" || val == "null" {
				idStokBahan = nil
				f.PupukDetails.IDStokBahan = nil
			} else {
				// Check if val is a valid UUID
				_, err := uuid.Parse(val)
				if err != nil {
					// It is NOT a valid UUID! It must be a literal material name like "Kotoran domba"
					// Let's resolve the UUID by looking up/inserting into gardening.stok_bahan
					resolvedUUID, err := r.resolveStokBahanByName(ctx, val)
					if err != nil {
						return err
					}
					idStokBahan = &resolvedUUID
					f.PupukDetails.IDStokBahan = &resolvedUUID
				}
			}
		}
	} else {
		targetName = "Kompos"
		satuan = "kg"
	}

	idAccount := f.IDAccount
	if idAccount != nil && (*idAccount == "" || *idAccount == "undefined" || *idAccount == "null") {
		idAccount = nil
		f.IDAccount = nil
	}

	query := `
		INSERT INTO gardening.fermentasi_pupuk (tanggal_mulai, status, notes, id_account, target_pupuk_name, target_jumlah, satuan, id_stok_bahan)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id_fermentasi, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query, f.TanggalMulai, f.Status, f.Notes, idAccount, targetName, targetJumlah, satuan, idStokBahan).
		Scan(&f.IDFermentasi, &f.CreatedAt, &f.UpdatedAt)
	if err != nil {
		return err
	}

	if f.PupukDetails != nil {
		f.PupukDetails.IDFermentasiPupuk = f.IDFermentasi
		f.PupukDetails.CreatedAt = f.CreatedAt
		f.PupukDetails.UpdatedAt = f.UpdatedAt
	}

	return nil
}

func (r *fermentasiRepository) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	query := `
		UPDATE gardening.fermentasi_pupuk
		SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
		WHERE id_fermentasi = $3
	`
	_, err := r.db.Exec(ctx, query, status, notes, id)
	return err
}

// === LOGS ===

func (r *fermentasiRepository) FindLogsByFermentasiID(ctx context.Context, fermentasiID string) ([]*domain.LogFermentasi, error) {
	query := `
		SELECT id_log, id_fermentasi, tanggal_cek, suhu, kelembaban, kondisi_fisik, notes, status, id_account, created_at
		FROM gardening.log_fermentasi_pupuk
		WHERE id_fermentasi = $1
		ORDER BY tanggal_cek DESC
	`
	rows, err := r.db.Query(ctx, query, fermentasiID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.LogFermentasi
	for rows.Next() {
		l := &domain.LogFermentasi{}
		var tgl time.Time
		err := rows.Scan(
			&l.IDLog, &l.IDFermentasi, &tgl, &l.Suhu, &l.Kelembaban, &l.KondisiFisik, &l.Notes, &l.Status, &l.IDAccount, &l.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		l.TanggalCek = tgl
		list = append(list, l)
	}
	return list, nil
}

func (r *fermentasiRepository) StoreLog(ctx context.Context, l *domain.LogFermentasi) error {
	l.TanggalCek = time.Now()
	idAccount := l.IDAccount
	if idAccount != nil && (*idAccount == "" || *idAccount == "undefined" || *idAccount == "null") {
		idAccount = nil
		l.IDAccount = nil
	}
	query := `
		INSERT INTO gardening.log_fermentasi_pupuk (id_fermentasi, tanggal_cek, suhu, kelembaban, kondisi_fisik, notes, status, id_account)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id_log, created_at
	`
	return r.db.QueryRow(ctx, query, l.IDFermentasi, l.TanggalCek, l.Suhu, l.Kelembaban, l.KondisiFisik, l.Notes, l.Status, idAccount).
		Scan(&l.IDLog, &l.CreatedAt)
}

func (r *fermentasiRepository) resolveStokBahanByName(ctx context.Context, name string) (string, error) {
	// 1. Try to find the existing material by name (case-insensitive)
	var id string
	querySelect := `SELECT id_stok_bahan FROM gardening.stok_bahan WHERE LOWER(nama_bahan) = LOWER($1) LIMIT 1`
	err := r.db.QueryRow(ctx, querySelect, name).Scan(&id)
	if err == nil {
		return id, nil
	}

	// 2. If it does not exist, insert it with 0 stock
	queryInsert := `
		INSERT INTO gardening.stok_bahan (nama_bahan, stok_tersedia, satuan)
		VALUES ($1, 0.00, 'kg')
		RETURNING id_stok_bahan
	`
	err = r.db.QueryRow(ctx, queryInsert, name).Scan(&id)
	if err != nil {
		return "", err
	}
	return id, nil
}

