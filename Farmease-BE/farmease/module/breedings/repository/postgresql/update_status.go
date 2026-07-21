package postgresql

import (
	"context"
	"time"
)

// UpdateStatus updates the breeding status and triggers subsequent updates (e.g. marking sheep as pregnant, inserting pregnancy entries).
func (r *Repository) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `UPDATE breeding.matings SET status = $1::breeding.mating_status_enum, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id_mating = $3 RETURNING id_sheep_female, mating_date`
	var idSheepFemale string
	var matingDate time.Time
	err = tx.QueryRow(ctx, query, status, notes, id).Scan(&idSheepFemale, &matingDate)
	if err != nil {
		return err
	}

	if status == "sukses" {
		// Update sheep status to pregnant (hamil)
		updateSheepQuery := `UPDATE livestock.sheep SET status = 'hamil', updated_at = CURRENT_TIMESTAMP WHERE id_sheep = $1`
		_, err = tx.Exec(ctx, updateSheepQuery, idSheepFemale)
		if err != nil {
			return err
		}

		// Insert pregnancy record (approx. expected birth date is 150 days from mating)
		expectedBirth := matingDate.AddDate(0, 0, 150)
		insertPregnancy := `
			INSERT INTO breeding.pregnancies (id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes)
			VALUES ($1, $2, 'dikandung', $3, 'Otomatis dari pencatatan perkawinan sukses')
			ON CONFLICT DO NOTHING
		`
		_, err = tx.Exec(ctx, insertPregnancy, id, matingDate, expectedBirth)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}
