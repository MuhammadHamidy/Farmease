package postgresql

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (r *Repository) FindAllBirths(ctx context.Context, from, to *time.Time) ([]*domain.Birth, error) {
	query := `SELECT id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes, created_at FROM breeding.births WHERE 1=1`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Birth
	for rows.Next() {
		var k domain.Birth
		err := rows.Scan(&k.IDBirth, &k.IDPregnancy, &k.BirthDate, &k.NumberOfOffspring, &k.OffspringGender, &k.OffspringCondition, &k.Notes, &k.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, &k)
	}
	return list, nil
}
