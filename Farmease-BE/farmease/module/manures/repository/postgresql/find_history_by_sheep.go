package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)

func (r *Repository) FindHistoryBySheep(ctx context.Context, idSheep string) ([]*domain.Manure, error) {
	query := `SELECT id_manure, id_sheep, activity_type, amount, unit, external_destination_id, destination_type, notes, created_at FROM livestock.manures WHERE id_sheep = $1 ORDER BY created_at DESC`
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
