package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

// Store creates a new mating record in the database using a safe SQL transaction.
func (r *Repository) Store(ctx context.Context, mating *domain.Mating) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var strawCode, inseminator *string
	if mating.StrawCode != "" {
		strawCode = &mating.StrawCode
	}
	if mating.Inseminator != "" {
		inseminator = &mating.Inseminator
	}

	query := `
		INSERT INTO breeding.matings (id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes, straw_code, inseminator)
		VALUES ($1, $2, $3::DATE, $4::breeding.mating_method_enum, $5::breeding.mating_status_enum, $6, $7, $8, $9, $10)
		RETURNING id_mating, created_at, updated_at`
	err = tx.QueryRow(ctx, query, mating.IDSheepMale, mating.IDSheepFemale, mating.MatingDate, mating.MatingMethod, mating.Status, mating.InbreedingFlag, mating.CoefficientOfInbreeding, mating.Notes, strawCode, inseminator).Scan(&mating.IDMating, &mating.CreatedAt, &mating.UpdatedAt)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
