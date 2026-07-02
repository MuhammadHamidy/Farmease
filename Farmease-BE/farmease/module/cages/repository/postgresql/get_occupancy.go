package postgresql

import (
	"context"
)

func (r *Repository) GetOccupancy(ctx context.Context, id string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM livestock.sheep WHERE id_cage = $1 AND status = 'aktif'`
	err := r.db.QueryRow(ctx, query, id).Scan(&count)
	return count, err
}
