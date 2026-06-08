package postgresql

import (
	"context"
	"fmt"

	"github.com/farmease/farmease-be/farmease/module/cages/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll(ctx context.Context, filter domain.CageFilter) ([]*domain.Cage, int, error) {
	query := `
		SELECT id_cage, cage_code, capacity, cage_type,
		       (SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = c.id_cage AND status = 'aktif') as occupancy,
		       created_at, updated_at, farm_id
		FROM master.cages c
		WHERE 1=1`
	
	args := []interface{}{}
	if filter.CageType != "" {
		args = append(args, filter.CageType)
		query += fmt.Sprintf(" AND cage_type = $%d", len(args))
	}

	// Pagination
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

	var cages []*domain.Cage
	for rows.Next() {
		var c domain.Cage
		err := rows.Scan(&c.IDCage, &c.CageCode, &c.Capacity, &c.CageType, &c.Occupancy, &c.CreatedAt, &c.UpdatedAt, &c.FarmID)
		if err != nil {
			return nil, 0, err
		}
		cages = append(cages, &c)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM master.cages WHERE 1=1"
	if filter.CageType != "" {
		countQuery += " AND cage_type = $1"
		err = r.db.QueryRow(ctx, countQuery, filter.CageType).Scan(&total)
	} else {
		err = r.db.QueryRow(ctx, countQuery).Scan(&total)
	}

	return cages, total, err
}

func (r *Repository) FindByID(ctx context.Context, id int) (*domain.Cage, error) {
	query := `
		SELECT id_cage, cage_code, capacity, cage_type,
		       (SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = c.id_cage AND status = 'aktif') as occupancy,
		       created_at, updated_at, farm_id
		FROM master.cages c
		WHERE id_cage = $1`

	var c domain.Cage
	err := r.db.QueryRow(ctx, query, id).Scan(&c.IDCage, &c.CageCode, &c.Capacity, &c.CageType, &c.Occupancy, &c.CreatedAt, &c.UpdatedAt, &c.FarmID)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Cage, error) {
	query := `SELECT id_cage, cage_code, capacity, cage_type, farm_id FROM master.cages WHERE cage_code = $1`
	var c domain.Cage
	err := r.db.QueryRow(ctx, query, code).Scan(&c.IDCage, &c.CageCode, &c.Capacity, &c.CageType, &c.FarmID)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *Repository) Store(ctx context.Context, c *domain.Cage) error {
	query := `
		INSERT INTO master.cages (cage_code, capacity, cage_type, farm_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id_cage, created_at, updated_at`
	return r.db.QueryRow(ctx, query, c.CageCode, c.Capacity, c.CageType, c.FarmID).Scan(&c.IDCage, &c.CreatedAt, &c.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, c *domain.Cage) error {
	query := `
		UPDATE master.cages
		SET cage_code = $1, capacity = $2, cage_type = $3, farm_id = $4, updated_at = CURRENT_TIMESTAMP
		WHERE id_cage = $5`
	_, err := r.db.Exec(ctx, query, c.CageCode, c.Capacity, c.CageType, c.FarmID, c.IDCage)
	return err
}

func (r *Repository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM master.cages WHERE id_cage = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *Repository) GetOccupancy(ctx context.Context, id int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = $1 AND status = 'aktif'`
	err := r.db.QueryRow(ctx, query, id).Scan(&count)
	return count, err
}

func (r *Repository) GetCageStats(ctx context.Context, id int) (*domain.CageStats, error) {
	var stats domain.CageStats
	query := `
		SELECT 
			COUNT(*) as total_animals,
			COUNT(*) FILTER (WHERE status = 'Sehat') as healthy,
			COUNT(*) FILTER (WHERE status IN ('Sakit', 'Hamil')) as attention_needed
		FROM livestock.sheep 
		WHERE id_cage = $1`
	var totalAnimals, healthy, attentionNeeded int64
	err := r.db.QueryRow(ctx, query, id).Scan(&totalAnimals, &healthy, &attentionNeeded)
	if err != nil {
		return nil, err
	}
	stats.TotalAnimals = int(totalAnimals)
	stats.Healthy = int(healthy)
	stats.AttentionNeeded = int(attentionNeeded)
	return &stats, nil
}

func (r *Repository) GetCageWeightStats(ctx context.Context, id int) (*domain.CageWeightStats, error) {
	query := `
		WITH monthly_avg AS (
			SELECT 
				to_char(date_trunc('month', w.weighing_date), 'YYYY-MM-01') as month_date,
				AVG(w.weight_kg) as avg_weight
			FROM livestock.weights w
			JOIN livestock.sheep s ON s.id_sheep = w.id_sheep
			WHERE s.id_cage = $1
			GROUP BY date_trunc('month', w.weighing_date)
			ORDER BY date_trunc('month', w.weighing_date) DESC
			LIMIT 5
		)
		SELECT month_date, avg_weight FROM monthly_avg ORDER BY month_date ASC`

	rows, err := r.db.Query(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats domain.CageWeightStats
	stats.MonthlyTrend = make([]domain.MonthlyWeight, 0)
	
	for rows.Next() {
		var mw domain.MonthlyWeight
		if err := rows.Scan(&mw.Month, &mw.Weight); err != nil {
			return nil, err
		}
		stats.MonthlyTrend = append(stats.MonthlyTrend, mw)
	}

	if len(stats.MonthlyTrend) > 0 {
		stats.CurrentAverage = stats.MonthlyTrend[len(stats.MonthlyTrend)-1].Weight
		if len(stats.MonthlyTrend) > 1 {
			first := stats.MonthlyTrend[0].Weight
			last := stats.CurrentAverage
			stats.GrowthKg = last - first
			if first > 0 {
				stats.GrowthPercentage = (stats.GrowthKg / first) * 100.0
			}
		}
	}

	return &stats, nil
}
