package postgresql

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/healths/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll(ctx context.Context, filter domain.HealthFilter) ([]*domain.Health, int, error) {
	query := `SELECT id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes, created_at, updated_at FROM livestock.healths WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep > 0 {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND id_sheep = $%d", len(args))
	}

	query += " ORDER BY checkup_date DESC"

	limit := filter.PerPage
	if limit <= 0 {
		limit = 20
	}
	offset := (filter.Page - 1) * limit
	if offset < 0 {
		offset = 0
	}
	query += fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var healths []*domain.Health
	for rows.Next() {
		var k domain.Health
		err := rows.Scan(&k.IDHealth, &k.IDSheep, &k.CheckupDate, &k.Diagnosis, &k.Action, &k.MedicineGiven, &k.InspectorName, &k.Notes, &k.CreatedAt, &k.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		healths = append(healths, &k)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.healths WHERE 1=1"
	if filter.IDSheep > 0 {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return healths, total, err
}

func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep int) ([]*domain.Health, error) {
	query := `SELECT id_health, id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes, created_at, updated_at FROM livestock.healths WHERE id_sheep = $1 ORDER BY checkup_date DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Health
	for rows.Next() {
		var k domain.Health
		err := rows.Scan(&k.IDHealth, &k.IDSheep, &k.CheckupDate, &k.Diagnosis, &k.Action, &k.MedicineGiven, &k.InspectorName, &k.Notes, &k.CreatedAt, &k.UpdatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &k)
	}
	return list, nil
}

func (r *Repository) Store(ctx context.Context, k *domain.Health) error {
	query := `INSERT INTO livestock.healths (id_sheep, checkup_date, diagnosis, action, medicine_given, inspector_name, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_health, created_at, updated_at`
	return r.db.QueryRow(ctx, query, k.IDSheep, k.CheckupDate, k.Diagnosis, k.Action, k.MedicineGiven, k.InspectorName, k.Notes).Scan(&k.IDHealth, &k.CreatedAt, &k.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, k *domain.Health) error {
	query := `UPDATE livestock.healths SET diagnosis = $1, action = $2, medicine_given = $3, inspector_name = $4, notes = $5, updated_at = CURRENT_TIMESTAMP WHERE id_health = $6`
	_, err := r.db.Exec(ctx, query, k.Diagnosis, k.Action, k.MedicineGiven, k.InspectorName, k.Notes, k.IDHealth)
	return err
}
