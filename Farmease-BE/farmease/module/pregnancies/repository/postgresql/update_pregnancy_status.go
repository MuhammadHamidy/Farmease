package postgresql

import (
	"context"
)

func (r *Repository) UpdatePregnancyStatus(ctx context.Context, id string, status string, notes string) error {
	query := `UPDATE breeding.pregnancies SET pregnancy_status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id_pregnancy = $3`
	_, err := r.db.Exec(ctx, query, status, notes, id)
	return err
}
