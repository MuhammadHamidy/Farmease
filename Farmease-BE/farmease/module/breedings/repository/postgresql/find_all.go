package postgresql

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

// FindAll queries all mating records from the database using optional filters (status, inbreeding flag).
func (r *Repository) FindAll(ctx context.Context, status string, inbreedingFlag *bool) ([]*domain.Mating, error) {
	query := `
		SELECT p.id_mating, p.id_sheep_male, p.id_sheep_female, p.mating_date, p.mating_method, p.status, 
		       COALESCE(p.inbreeding_flag, FALSE), COALESCE(p.coefficient_of_inbreeding, 0.0), COALESCE(p.notes, ''), 
		       p.straw_code, p.inseminator,
		       dj.sheep_name as nama_jantan, db.sheep_name as nama_betina
		FROM breeding.matings p
		JOIN livestock.sheep dj ON p.id_sheep_male = dj.id_sheep
		JOIN livestock.sheep db ON p.id_sheep_female = db.id_sheep
		WHERE 1=1`
	
	args := []interface{}{}
	if status != "" {
		args = append(args, status)
		query += " AND p.status = $1"
	}
	if inbreedingFlag != nil {
		args = append(args, *inbreedingFlag)
		query += fmt.Sprintf(" AND p.inbreeding_flag = $%d", len(args))
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matingList []*domain.Mating
	for rows.Next() {
		var mating domain.Mating
		var maleSheep, femaleSheep domain.SheepShort
		var strawCode, inseminator *string
		err := rows.Scan(
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
		matingList = append(matingList, &mating)
	}
	return matingList, nil
}
