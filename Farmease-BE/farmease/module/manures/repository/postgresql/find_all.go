package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

// FindAll queries all recorded manure entries with pagination filters.
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

	var manureList []*domain.Manure
	for rows.Next() {
		var manure domain.Manure
		var idSheepStr, idCageStr, extDestStr, notesStr string
		err := rows.Scan(&manure.IDManure, &idSheepStr, &idCageStr, &manure.ActivityType, &manure.Amount, &manure.Unit, &extDestStr, &manure.DestinationType, &notesStr, &manure.CreatedAt)
		if err != nil {
			return nil, 0, err
		}
		manure.IDSheep = idSheepStr
		manure.IDCage = idCageStr
		manure.Notes = notesStr
		if extDestStr != "" {
			manure.ExternalDestinationID = &extDestStr
		}
		manureList = append(manureList, &manure)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.manures WHERE 1=1"
	if filter.IDSheep != "" {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return manureList, total, err
}
