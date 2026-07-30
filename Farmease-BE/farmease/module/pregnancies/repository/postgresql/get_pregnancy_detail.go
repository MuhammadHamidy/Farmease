package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
)

// GetPregnancyDetail queries detailed gestational fields of a pregnancy record.
func (r *Repository) GetPregnancyDetail(ctx context.Context, id string) (*domain.Pregnancy, error) {
	query := `
		SELECT k.id_pregnancy, k.id_mating, k.pregnancy_date, k.pregnancy_status, k.expected_birth_date, k.notes,
		       p.id_sheep_male, p.id_sheep_female
		FROM breeding.pregnancies k
		JOIN breeding.matings p ON k.id_mating = p.id_mating
		WHERE k.id_pregnancy = $1`
	
	var pregnancy domain.Pregnancy
	err := r.db.QueryRow(ctx, query, id).Scan(&pregnancy.IDPregnancy, &pregnancy.IDMating, &pregnancy.PregnancyDate, &pregnancy.PregnancyStatus, &pregnancy.ExpectedBirthDate, &pregnancy.Notes, &pregnancy.IDFather, &pregnancy.IDMother)
	if err != nil {
		return nil, err
	}
	return &pregnancy, nil
}
