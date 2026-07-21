package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) StoreFeedingMixture(ctx context.Context, fm *domain.FeedingMixture) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `INSERT INTO logistics.feeding_mixtures (id_sheep, feeding_date, total_amount, unit, notes)
	          VALUES ($1, $2, $3, $4, $5) RETURNING id_feeding_mixture, created_at`
	err = tx.QueryRow(ctx, query, fm.IDSheep, fm.FeedingDate, fm.TotalAmount, fm.Unit, fm.Notes).Scan(&fm.IDFeedingMixture, &fm.CreatedAt)
	if err != nil {
		return err
	}

	detailQuery := `INSERT INTO logistics.feeding_mixture_details (id_feeding_mixture, id_feed, amount)
	                VALUES ($1, $2, $3) RETURNING id_detail`
	for i, d := range fm.Details {
		var idDetail string
		err = tx.QueryRow(ctx, detailQuery, fm.IDFeedingMixture, d.IDFeed, d.Amount).Scan(&idDetail)
		if err != nil {
			return err
		}
		fm.Details[i].IDDetail = idDetail
		fm.Details[i].IDFeedingMixture = fm.IDFeedingMixture
	}

	return tx.Commit(ctx)
}
