package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

// FindByID retrieves a single mating record by ID, attaching the parent sheep names.
func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Mating, error) {
	query := `
		SELECT p.id_mating, p.id_sheep_male, p.id_sheep_female, p.mating_date, p.mating_method, p.status, 
		       COALESCE(p.inbreeding_flag, FALSE), COALESCE(p.coefficient_of_inbreeding, 0.0), COALESCE(p.notes, ''), 
		       p.straw_code, p.inseminator,
		       dj.sheep_name as name_male, db.sheep_name as name_female
		FROM breeding.matings p
		JOIN livestock.sheep dj ON p.id_sheep_male = dj.id_sheep
		JOIN livestock.sheep db ON p.id_sheep_female = db.id_sheep
		WHERE p.id_mating = $1`

	var mating domain.Mating
	var maleSheep, femaleSheep domain.SheepShort
	var strawCode, inseminator *string
	err := r.db.QueryRow(ctx, query, id).Scan(
		&mating.IDMating, &mating.IDSheepMale, &mating.IDSheepFemale, &mating.MatingDate, &mating.MatingMethod, &mating.Status, &mating.InbreedingFlag, &mating.CoefficientOfInbreeding, &mating.Notes, &strawCode, &inseminator,
		&maleSheep.SheepName, &femaleSheep.SheepName,
	)
	if err != nil {
		return nil, err
	}
	if strawCode != nil {
		mating.StrawCode = *strawCode
	}
	if inseminator != nil {
		mating.Inseminator = *inseminator
	}
	maleSheep.IDSheep = mating.IDSheepMale
	femaleSheep.IDSheep = mating.IDSheepFemale
	mating.MaleSheep = &maleSheep
	mating.FemaleSheep = &femaleSheep
	return &mating, nil
}
