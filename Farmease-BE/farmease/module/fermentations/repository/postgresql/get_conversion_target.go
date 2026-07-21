package postgresql

import (
	"context"
)

// GetConversionTarget checks feed item output amount targeted by a fermentation conversion registry.
func (r *Repository) GetConversionTarget(ctx context.Context, conversionID string) (string, float64, error) {
	query := `SELECT id_target_feed, target_amount FROM logistics.silage_conversions WHERE id_conversion = $1`
	var targetFeedID string
	var targetAmount float64
	err := r.db.QueryRow(ctx, query, conversionID).Scan(&targetFeedID, &targetAmount)
	return targetFeedID, targetAmount, err
}
