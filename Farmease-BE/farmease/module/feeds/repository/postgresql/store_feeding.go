package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) StoreFeeding(ctx context.Context, f *domain.Feeding) error {
	query := `INSERT INTO logistics.feedings (id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_feeding`
	return r.db.QueryRow(ctx, query, f.IDSheep, f.IDFeed, f.FeedingDate, f.Amount, f.Unit, f.Notes).Scan(&f.IDFeeding)
}
