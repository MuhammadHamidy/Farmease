package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (r *Repository) FindAll(ctx context.Context, filter domain.ManureFilter) ([]*domain.Manure, int, error) {
	query := `SELECT id_manure, COALESCE(id_sheep::text, ''), COALESCE(id_cage::text, ''), activity_type, amount, unit, COALESCE(external_destination_id, ''), COALESCE(destination_type::text, 'internal'), COALESCE(notes, ''), created_at FROM livestock.manures WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep != "" {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND id_sheep = $%d", len(args))
	}

	query += " ORDER BY created_at DESC"

	limit := filter.PerPage
	if limit <= 0 {
		limit = 100
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
		var idSheepStr, idCageStr, extDestStr, notesStr string
		err := rows.Scan(&m.IDManure, &idSheepStr, &idCageStr, &m.ActivityType, &m.Amount, &m.Unit, &extDestStr, &m.DestinationType, &notesStr, &m.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		m.IDSheep = idSheepStr
		m.IDCage = idCageStr
		m.Notes = notesStr
		if extDestStr != "" {
			m.ExternalDestinationID = &extDestStr
		}
		list = append(list, &m)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.manures WHERE 1=1"
	if filter.IDSheep != "" {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return list, total, err
}
