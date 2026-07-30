package postgresql

import (
	"context"
	"time"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

// FindAllBirths retrieves all recorded births within an optional timeframe.
func (r *Repository) FindAllBirths(ctx context.Context, from, to *time.Time) ([]*domain.Birth, error) {
	query := `SELECT id_birth, id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes, created_at FROM breeding.births WHERE 1=1`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var birthList []*domain.Birth
	for rows.Next() {
		var birth domain.Birth
		err := rows.Scan(&birth.IDBirth, &birth.IDPregnancy, &birth.BirthDate, &birth.NumberOfOffspring, &birth.OffspringGender, &birth.OffspringCondition, &birth.Notes, &birth.CreatedAt)
		if err != nil {
			return nil, err
		}
		birthList = append(birthList, &birth)
	}
	return birthList, nil
}
