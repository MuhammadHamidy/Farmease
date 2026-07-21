package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

func (r *Repository) Store(ctx context.Context, p *domain.Mating) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var strawCode, inseminator *string
	if p.StrawCode != "" {
		strawCode = &p.StrawCode
	}
	if p.Inseminator != "" {
		inseminator = &p.Inseminator
	}

	query := `
		INSERT INTO breeding.matings (id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes, straw_code, inseminator)
		VALUES ($1, $2, $3::DATE, $4::breeding.mating_method_enum, $5::breeding.mating_status_enum, $6, $7, $8, $9, $10)
		RETURNING id_mating, created_at, updated_at`
	err = tx.QueryRow(ctx, query, p.IDSheepMale, p.IDSheepFemale, p.MatingDate, p.MatingMethod, p.Status, p.InbreedingFlag, p.CoefficientOfInbreeding, p.Notes, strawCode, inseminator).Scan(&p.IDMating, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
