package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
)

func (r *Repository) FindAllFeedings(ctx context.Context, filter domain.FeedingFilter) ([]*domain.Feeding, int, error) {
	query := `
		SELECT pp.id_feeding, pp.id_sheep, pp.id_feed, pp.feeding_date, pp.amount, pp.unit, pp.notes, p.feed_name
		FROM logistics.feedings pp
		JOIN logistics.feeds p ON pp.id_feed = p.id_feed
		WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep != "" {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND pp.id_sheep = $%d", len(args))
	}

	query += " ORDER BY pp.feeding_date DESC"

	limit := filter.PerPage
	if limit <= 0 {
		limit = 100
	}
	offset := (filter.Page - 1) * limit
	if offset < 0 {
		offset = 0
	}
	query += fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*domain.Feeding
	for rows.Next() {
		var p domain.Feeding
		err := rows.Scan(&p.IDFeeding, &p.IDSheep, &p.IDFeed, &p.FeedingDate, &p.Amount, &p.Unit, &p.Notes, &p.FeedName)
		if err != nil {
			return nil, 0, err
		}
		list = append(list, &p)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM logistics.feedings WHERE 1=1"
	if filter.IDSheep != "" {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return list, total, err
}
