package postgresql

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/manures/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll(ctx context.Context, filter domain.ManureFilter) ([]*domain.Manure, int, error) {
	query := `SELECT id_manure, id_sheep, activity_type, amount, unit, external_destination_id, destination_type, notes, created_at FROM logistics.manures WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep > 0 {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND id_sheep = $%d", len(args))
	}

	query += " ORDER BY created_at DESC"

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

	var list []*domain.Manure
	for rows.Next() {
		var m domain.Manure
		err := rows.Scan(&m.IDManure, &m.IDSheep, &m.ActivityType, &m.Amount, &m.Unit, &m.ExternalDestinationID, &m.DestinationType, &m.Notes, &m.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		list = append(list, &m)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM logistics.manures WHERE 1=1"
	if filter.IDSheep > 0 {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return list, total, err
}

func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep int) ([]*domain.Manure, error) {
	query := `SELECT id_manure, id_sheep, activity_type, amount, unit, external_destination_id, destination_type, notes, created_at FROM logistics.manures WHERE id_sheep = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Manure
	for rows.Next() {
		var m domain.Manure
		err := rows.Scan(&m.IDManure, &m.IDSheep, &m.ActivityType, &m.Amount, &m.Unit, &m.ExternalDestinationID, &m.DestinationType, &m.Notes, &m.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &m)
	}
	return list, nil
}

func (r *Repository) Store(ctx context.Context, m *domain.Manure) error {
	query := `INSERT INTO logistics.manures (id_sheep, activity_type, amount, unit, external_destination_id, destination_type, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_manure, created_at`
	return r.db.QueryRow(ctx, query, m.IDSheep, m.ActivityType, m.Amount, m.Unit, m.ExternalDestinationID, m.DestinationType, m.Notes).Scan(&m.IDManure, &m.CreatedAt)
}
