package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) FindFeedingHistory(ctx context.Context, idSheep string) ([]*domain.Feeding, error) {
	query := `
		SELECT pp.id_feeding, pp.id_sheep, pp.id_feed, pp.feeding_date, pp.amount, pp.unit, pp.notes, p.feed_name
		FROM logistics.feedings pp
		JOIN logistics.feeds p ON pp.id_feed = p.id_feed
		WHERE pp.id_sheep = $1
		ORDER BY pp.feeding_date DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Feeding
	for rows.Next() {
		var p domain.Feeding
		err := rows.Scan(&p.IDFeeding, &p.IDSheep, &p.IDFeed, &p.FeedingDate, &p.Amount, &p.Unit, &p.Notes, &p.FeedName)
		if err != nil {
			return nil, err
		}
		list = append(list, &p)
	}
	return list, nil
}
