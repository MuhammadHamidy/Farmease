package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) StoreMaster(ctx context.Context, p *domain.Feed) error {
	query := `INSERT INTO logistics.feeds (feed_name, unit, available_stock, price_per_unit, category, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_feed`
	return r.db.QueryRow(ctx, query, p.FeedName, p.Unit, p.AvailableStock, p.PricePerUnit, p.Category, p.Notes).Scan(&p.IDFeed)
}
