package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

// StoreBirth inserts a birth record including offspring quantity and conditions.
func (r *Repository) StoreBirth(ctx context.Context, birth *domain.Birth) error {
	query := `
		INSERT INTO breeding.births (id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id_birth, created_at`
	return r.db.QueryRow(ctx, query, birth.IDPregnancy, birth.BirthDate, birth.NumberOfOffspring, birth.OffspringGender, birth.OffspringCondition, birth.Notes).Scan(&birth.IDBirth, &birth.CreatedAt)
}
