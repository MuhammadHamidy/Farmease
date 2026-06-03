package postgresql

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAllMaster(ctx context.Context) ([]*domain.Feed, error) {
	query := `SELECT id_feed, feed_name, unit, available_stock, price_per_unit, category, notes FROM logistics.feeds`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Feed
	for rows.Next() {
		var p domain.Feed
		err := rows.Scan(&p.IDFeed, &p.FeedName, &p.Unit, &p.AvailableStock, &p.PricePerUnit, &p.Category, &p.Notes)
		if err != nil {
			return nil, err
		}
		list = append(list, &p)
	}
	return list, nil
}

func (r *Repository) FindMasterByID(ctx context.Context, id int) (*domain.Feed, error) {
	query := `SELECT id_feed, feed_name, unit, available_stock, price_per_unit, category, notes FROM logistics.feeds WHERE id_feed = $1`
	var p domain.Feed
	err := r.db.QueryRow(ctx, query, id).Scan(&p.IDFeed, &p.FeedName, &p.Unit, &p.AvailableStock, &p.PricePerUnit, &p.Category, &p.Notes)
	return &p, err
}

func (r *Repository) StoreMaster(ctx context.Context, p *domain.Feed) error {
	query := `INSERT INTO logistics.feeds (feed_name, unit, available_stock, price_per_unit, category, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_feed`
	return r.db.QueryRow(ctx, query, p.FeedName, p.Unit, p.AvailableStock, p.PricePerUnit, p.Category, p.Notes).Scan(&p.IDFeed)
}

func (r *Repository) UpdateStock(ctx context.Context, id int, amount float64, actionType string) error {
	var query string
	if actionType == "tambah" {
		query = `UPDATE logistics.feeds SET available_stock = available_stock + $1 WHERE id_feed = $2`
	} else {
		query = `UPDATE logistics.feeds SET available_stock = available_stock - $1 WHERE id_feed = $2`
	}
	_, err := r.db.Exec(ctx, query, amount, id)
	return err
}

func (r *Repository) StoreFeeding(ctx context.Context, f *domain.Feeding) error {
	query := `INSERT INTO logistics.feedings (id_sheep, id_feed, feeding_date, amount, unit, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_feeding`
	return r.db.QueryRow(ctx, query, f.IDSheep, f.IDFeed, f.FeedingDate, f.Amount, f.Unit, f.Notes).Scan(&f.IDFeeding)
}

func (r *Repository) FindFeedingHistory(ctx context.Context, idSheep int) ([]*domain.Feeding, error) {
	query := `
		SELECT pp.id_feeding, pp.id_sheep, pp.id_feed, pp.feeding_date, pp.amount, pp.unit, pp.notes, p.feed_name
		FROM logistics.feedings pp
		JOIN logistics.feeds p ON pp.id_feed = p.id_feed
		WHERE pp.id_sheep = $1
		ORDER BY pp.feeding_date DESC`
	rows, err := r.db.Query(ctx, query, idSheep)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Feeding
	for rows.Next() {
		var p domain.Feeding
		err := rows.Scan(&p.IDFeeding, &p.IDSheep, &p.IDFeed, &p.FeedingDate, &p.Amount, &p.Unit, &p.Notes, &p.FeedName)
		if err != nil {
			return nil, err
		}
		list = append(list, &p)
	}
	return list, nil
}

func (r *Repository) FindAllFeedings(ctx context.Context, filter domain.FeedingFilter) ([]*domain.Feeding, int, error) {
	query := `
		SELECT pp.id_feeding, pp.id_sheep, pp.id_feed, pp.feeding_date, pp.amount, pp.unit, pp.notes, p.feed_name
		FROM logistics.feedings pp
		JOIN logistics.feeds p ON pp.id_feed = p.id_feed
		WHERE 1=1`
	args := []interface{}{}

	if filter.IDSheep > 0 {
		args = append(args, filter.IDSheep)
		query += fmt.Sprintf(" AND pp.id_sheep = $%d", len(args))
	}

	query += " ORDER BY pp.feeding_date DESC"

	limit := filter.PerPage
	if limit <= 0 {
		limit = 20
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
	if filter.IDSheep > 0 {
		countQuery += " AND id_sheep = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.IDSheep).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return list, total, err
}
