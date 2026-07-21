package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) FindAllMaster(ctx context.Context) ([]*domain.Feed, error) {
	query := `SELECT id_feed, feed_name, unit, available_stock, price_per_unit, category, notes FROM logistics.feeds`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Feed
	for rows.Next() {
		var feed domain.Feed
		err := rows.Scan(&feed.IDFeed, &feed.FeedName, &feed.Unit, &feed.AvailableStock, &feed.PricePerUnit, &feed.Category, &feed.Notes)
		if err != nil {
			return nil, err
		}
		list = append(list, &feed)
	}
	return list, nil
}
