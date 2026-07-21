package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

func (r *Repository) FindAllPregnancies(ctx context.Context, status string) ([]*domain.Pregnancy, error) {
	query := `
		SELECT k.id_pregnancy, k.id_mating, k.pregnancy_date, k.pregnancy_status, k.expected_birth_date, k.notes,
		       d.id_sheep, d.sheep_name,
		       p.id_sheep_male
		FROM breeding.pregnancies k
		JOIN breeding.matings p ON k.id_mating = p.id_mating
		JOIN livestock.sheep d ON p.id_sheep_female = d.id_sheep
		WHERE 1=1`
	
	args := []interface{}{}
	if status != "" {
		args = append(args, status)
		query += " AND k.pregnancy_status = $1"
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Pregnancy
	for rows.Next() {
		var k domain.Pregnancy
		var d domain.SheepShort
		err := rows.Scan(&k.IDPregnancy, &k.IDMating, &k.PregnancyDate, &k.PregnancyStatus, &k.ExpectedBirthDate, &k.Notes, &d.IDSheep, &d.SheepName, &k.IDFather)
		if err != nil {
			return nil, err
		}
		k.MotherSheep = &d
		k.DamSheep = &d
		list = append(list, &k)
	}
	return list, nil
}
