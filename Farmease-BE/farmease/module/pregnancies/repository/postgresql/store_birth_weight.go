package postgresql

import (
	"context"
	"time"
)

// StoreBirthWeight logs initial birth weight into weights table.
func (r *Repository) StoreBirthWeight(ctx context.Context, idSheep string, date time.Time, weight float64) error {
	query := `
		INSERT INTO livestock.weights (id_sheep, weighing_date, weight_kg, notes)
		VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(ctx, query, idSheep, date, weight, "Berat Lahir")
	return err
}
