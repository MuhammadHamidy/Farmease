package postgresql

import (
	"context"
)

func (r *Repository) UpdateStock(ctx context.Context, id string, amount float64, actionType string) error {
	var query string
	if actionType == "tambah" {
		query = `UPDATE logistics.feeds SET available_stock = available_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id_feed = $2`
	} else {
		query = `UPDATE logistics.feeds SET available_stock = available_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id_feed = $2`
	}
	_, err := r.db.Exec(ctx, query, amount, id)
	return err
}
