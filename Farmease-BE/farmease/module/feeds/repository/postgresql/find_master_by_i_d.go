package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) FindMasterByID(ctx context.Context, id string) (*domain.Feed, error) {
	query := `SELECT id_feed, feed_name, unit, available_stock, price_per_unit, category, notes FROM logistics.feeds WHERE id_feed = $1`
	var p domain.Feed
	err := r.db.QueryRow(ctx, query, id).Scan(&p.IDFeed, &p.FeedName, &p.Unit, &p.AvailableStock, &p.PricePerUnit, &p.Category, &p.Notes)
	return &p, err
}
