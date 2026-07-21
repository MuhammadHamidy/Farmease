package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) FindMasterByID(ctx context.Context, id string) (*domain.Feed, error) {
	query := `SELECT id_feed, feed_name, unit, available_stock, price_per_unit, category, notes FROM logistics.feeds WHERE id_feed = $1`
	var feed domain.Feed
	err := r.db.QueryRow(ctx, query, id).Scan(&feed.IDFeed, &feed.FeedName, &feed.Unit, &feed.AvailableStock, &feed.PricePerUnit, &feed.Category, &feed.Notes)
	return &feed, err
}
