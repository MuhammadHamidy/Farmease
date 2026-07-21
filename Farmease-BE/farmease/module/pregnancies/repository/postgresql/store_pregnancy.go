package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (r *Repository) StorePregnancy(ctx context.Context, k *domain.Pregnancy) error {
	query := `
		INSERT INTO breeding.pregnancies (id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_pregnancy, created_at, updated_at`
	return r.db.QueryRow(ctx, query, k.IDMating, k.PregnancyDate, k.PregnancyStatus, k.ExpectedBirthDate, k.Notes).Scan(&k.IDPregnancy, &k.CreatedAt, &k.UpdatedAt)
}
