package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (r *Repository) GetCageWeightStats(ctx context.Context, id string) (*domain.CageWeightStats, error) {
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
