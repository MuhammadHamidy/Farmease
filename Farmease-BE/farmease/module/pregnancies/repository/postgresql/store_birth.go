package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (r *Repository) StoreBirth(ctx context.Context, k *domain.Birth) error {
	query := `
		INSERT INTO breeding.births (id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id_birth, created_at`
	return r.db.QueryRow(ctx, query, k.IDPregnancy, k.BirthDate, k.NumberOfOffspring, k.OffspringGender, k.OffspringCondition, k.Notes).Scan(&k.IDBirth, &k.CreatedAt)
}
