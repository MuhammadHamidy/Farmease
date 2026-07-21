package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

// FindHistoryBySheep lists historical manure collections/distributions for a specific sheep ID.
func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Manure, error) {
	query := `SELECT id_manure, COALESCE(id_sheep::text, ''), COALESCE(id_cage::text, ''), activity_type, amount, unit, COALESCE(external_destination_id, ''), COALESCE(destination_type::text, 'internal'), COALESCE(notes, ''), created_at FROM livestock.manures WHERE id_sheep = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var manureList []*domain.Manure
	for rows.Next() {
		var manure domain.Manure
		var idSheepStr, idCageStr, extDestStr, notesStr string
		err := rows.Scan(&manure.IDManure, &idSheepStr, &idCageStr, &manure.ActivityType, &manure.Amount, &manure.Unit, &extDestStr, &manure.DestinationType, &notesStr, &manure.CreatedAt)
		if err != nil {
			return nil, err
		}
		manure.IDSheep = idSheepStr
		manure.IDCage = idCageStr
		manure.Notes = notesStr
		if extDestStr != "" {
			manure.ExternalDestinationID = &extDestStr
		}
		manureList = append(manureList, &manure)
	}
	return manureList, nil
}
