package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (r *Repository) Store(ctx context.Context, m *domain.Manure) error {
	destType := m.DestinationType
	if destType == "" {
		destType = "internal"
	}

	var sheepID, cageID *string

	if m.IDSheep != "" {
		var resolvedSheepID string
		err := r.db.QueryRow(ctx, `SELECT id_sheep FROM livestock.sheep WHERE sheep_code = $1 OR id_sheep::text = $1 LIMIT 1`, m.IDSheep).Scan(&resolvedSheepID)
		if err == nil && resolvedSheepID != "" {
			sheepID = &resolvedSheepID
		} else {
			sheepID = &m.IDSheep
		}
	}

	if m.IDCage != "" {
		var resolvedCageID string
		err := r.db.QueryRow(ctx, `SELECT id_cage FROM livestock.cages WHERE cage_code = $1 OR id_cage::text = $1 LIMIT 1`, m.IDCage).Scan(&resolvedCageID)
		if err == nil && resolvedCageID != "" {
			cageID = &resolvedCageID
		} else {
			cageID = &m.IDCage
		}
	}

	query := `INSERT INTO livestock.manures (id_sheep, id_cage, activity_type, amount, unit, external_destination_id, destination_type, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_manure, created_at`
	return r.db.QueryRow(ctx, query, sheepID, cageID, m.ActivityType, m.Amount, m.Unit, m.ExternalDestinationID, destType, m.Notes).Scan(&m.IDManure, &m.CreatedAt)
}
