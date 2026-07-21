package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

func (r *Repository) GetCageStats(ctx context.Context, id string) (*domain.CageStats, error) {
	var stats domain.CageStats
	query := `
		SELECT 
			COUNT(*) as total_animals,
			COUNT(*) FILTER (WHERE status = 'aktif') as healthy,
			COUNT(*) FILTER (WHERE status = 'hamil') as attention_needed
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
