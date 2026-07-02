package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (r *Repository) FindHistoryByCage(ctx context.Context, idCage string) ([]*domain.Manure, error) {
	// First resolve the cage code or ID to UUID
	var resolvedCageID string
	err := r.db.QueryRow(ctx, `SELECT id_cage FROM master.cages WHERE cage_code = $1 OR id_cage::text = $1 LIMIT 1`, idCage).Scan(&resolvedCageID)
	if err == nil && resolvedCageID != "" {
		idCage = resolvedCageID
	}

	query := `SELECT id_manure, COALESCE(id_sheep::text, ''), id_cage::text, activity_type, amount, unit, COALESCE(external_destination_id, ''), destination_type, notes, created_at FROM logistics.manures WHERE id_cage = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, idCage)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Manure
	for rows.Next() {
		var m domain.Manure
		var idSheepStr, idCageStr, extDestStr string
		err := rows.Scan(&m.IDManure, &idSheepStr, &idCageStr, &m.ActivityType, &m.Amount, &m.Unit, &extDestStr, &m.DestinationType, &m.Notes, &m.CreatedAt)
		if err != nil {
			return nil, err
		}
		m.IDSheep = idSheepStr
		m.IDCage = idCageStr
		if extDestStr != "" {
			m.ExternalDestinationID = &extDestStr
		}
		list = append(list, &m)
	}
	return list, nil
}
