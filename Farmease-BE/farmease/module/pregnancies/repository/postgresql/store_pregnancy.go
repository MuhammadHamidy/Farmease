package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

// StorePregnancy registers a new pregnancy session.
func (r *Repository) StorePregnancy(ctx context.Context, pregnancy *domain.Pregnancy) error {
	query := `
		INSERT INTO breeding.pregnancies (id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_pregnancy, created_at, updated_at`
	return r.db.QueryRow(ctx, query, pregnancy.IDMating, pregnancy.PregnancyDate, pregnancy.PregnancyStatus, pregnancy.ExpectedBirthDate, pregnancy.Notes).Scan(&pregnancy.IDPregnancy, &pregnancy.CreatedAt, &pregnancy.UpdatedAt)
}
