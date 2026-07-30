package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) FindAllSilageConversions(ctx context.Context) ([]*domain.SilageConversion, error) {
	query := `
		SELECT c.id_conversion, c.id_target_feed, c.conversion_date, c.target_amount, c.unit, c.notes, c.created_at, f.feed_name as target_feed_name,
		       COALESCE((
		           SELECT l.status 
		           FROM logistics.silage_fermentation_logs l 
		           WHERE l.id_conversion = c.id_conversion 
		           ORDER BY l.check_date DESC 
		           LIMIT 1
		       ), 'fermentasi') as status
		FROM logistics.silage_conversions c
		JOIN logistics.feeds f ON c.id_target_feed = f.id_feed
		ORDER BY c.conversion_date DESC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conversions []*domain.SilageConversion
	for rows.Next() {
		var sc domain.SilageConversion
		err = rows.Scan(&sc.IDConversion, &sc.IDTargetFeed, &sc.ConversionDate, &sc.TargetAmount, &sc.Unit, &sc.Notes, &sc.CreatedAt, &sc.TargetFeedName, &sc.Status)
		if err != nil {
			return nil, err
		}
		conversions = append(conversions, &sc)
	}

	// Fetch details for each conversion
	for _, sc := range conversions {
		detailQuery := `
			SELECT d.id_detail, d.id_conversion, d.id_feed, d.amount, f.feed_name
			FROM logistics.silage_conversion_details d
			JOIN logistics.feeds f ON d.id_feed = f.id_feed
			WHERE d.id_conversion = $1
		`
		dRows, err := r.db.Query(ctx, detailQuery, sc.IDConversion)
		if err != nil {
			return nil, err
		}
		
		var details []domain.SilageConversionDetail
		for dRows.Next() {
			var d domain.SilageConversionDetail
			err = dRows.Scan(&d.IDDetail, &d.IDConversion, &d.IDFeed, &d.Amount, &d.FeedName)
			if err != nil {
				dRows.Close()
				return nil, err
			}
			if sc.TargetAmount > 0 {
				d.Percentage = (d.Amount / sc.TargetAmount) * 100
			}
			details = append(details, d)
		}
		dRows.Close()
		sc.Details = details
	}

	return conversions, nil
}
