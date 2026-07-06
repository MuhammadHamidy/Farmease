package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Manure, error) {
	query := `SELECT id_manure, COALESCE(id_sheep::text, ''), COALESCE(id_cage::text, ''), activity_type, amount, unit, COALESCE(external_destination_id, ''), COALESCE(destination_type::text, 'internal'), COALESCE(notes, ''), created_at FROM livestock.manures WHERE id_sheep = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Manure
	for rows.Next() {
		var m domain.Manure
		var idSheepStr, idCageStr, extDestStr, notesStr string
		err := rows.Scan(&m.IDManure, &idSheepStr, &idCageStr, &m.ActivityType, &m.Amount, &m.Unit, &extDestStr, &m.DestinationType, &notesStr, &m.CreatedAt)
		if err != nil {
			return nil, err
		}
		m.IDSheep = idSheepStr
		m.IDCage = idCageStr
		m.Notes = notesStr
		if extDestStr != "" {
			m.ExternalDestinationID = &extDestStr
		}
		list = append(list, &m)
	}
	return list, nil
}
