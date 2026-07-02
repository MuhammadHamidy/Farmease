package postgresql

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

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

	var p domain.Mating
	var dj, db domain.SheepShort
	var strawCode, inseminator *string
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.IDMating, &p.IDSheepMale, &p.IDSheepFemale, &p.MatingDate, &p.MatingMethod, &p.Status, &p.InbreedingFlag, &p.CoefficientOfInbreeding, &p.Notes, &strawCode, &inseminator,
		&dj.SheepName, &db.SheepName,
	)
	if err != nil {
		return nil, err
	}
	if strawCode != nil {
		p.StrawCode = *strawCode
	}
	if inseminator != nil {
		p.Inseminator = *inseminator
	}
	dj.IDSheep = p.IDSheepMale
	db.IDSheep = p.IDSheepFemale
	p.MaleSheep = &dj
	p.FemaleSheep = &db
	return &p, nil
}
