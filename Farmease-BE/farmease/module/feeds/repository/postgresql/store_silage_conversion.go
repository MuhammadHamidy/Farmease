package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) StoreSilageConversion(ctx context.Context, sc *domain.SilageConversion) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `INSERT INTO logistics.silage_conversions (id_target_feed, conversion_date, target_amount, unit, notes)
	          VALUES ($1, $2, $3, $4, $5) RETURNING id_conversion, created_at`
	err = tx.QueryRow(ctx, query, sc.IDTargetFeed, sc.ConversionDate, sc.TargetAmount, sc.Unit, sc.Notes).Scan(&sc.IDConversion, &sc.CreatedAt)
	if err != nil {
		return err
	}

	detailQuery := `INSERT INTO logistics.silage_conversion_details (id_conversion, id_feed, amount)
	                VALUES ($1, $2, $3) RETURNING id_detail`
	for i, d := range sc.Details {
		var idDetail string
		err = tx.QueryRow(ctx, detailQuery, sc.IDConversion, d.IDFeed, d.Amount).Scan(&idDetail)
		if err != nil {
			return err
		}
		sc.Details[i].IDDetail = idDetail
		sc.Details[i].IDConversion = sc.IDConversion
	}

	logQuery := `INSERT INTO logistics.silage_fermentation_logs (id_conversion, status, ph_level, temperature, physical_condition, notes)
	             VALUES ($1, 'fermentasi', NULL, NULL, 'Fermentasi pakan dimulai', 'Inisiasi pakan silase baru')`
	_, err = tx.Exec(ctx, logQuery, sc.IDConversion)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
