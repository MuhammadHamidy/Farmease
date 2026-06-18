package postgresql

import (
	"context"
	"fmt"
	"time"

	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

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

	var list []*domain.Mating
	for rows.Next() {
		var p domain.Mating
		var dj, db domain.SheepShort
		var strawCode, inseminator *string
		err := rows.Scan(
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
		list = append(list, &p)
	}
	return list, nil
}

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

func (r *Repository) Store(ctx context.Context, p *domain.Mating) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var strawCode, inseminator *string
	if p.StrawCode != "" {
		strawCode = &p.StrawCode
	}
	if p.Inseminator != "" {
		inseminator = &p.Inseminator
	}

	query := `
		INSERT INTO breeding.matings (id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes, straw_code, inseminator)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id_mating, created_at, updated_at`
	err = tx.QueryRow(ctx, query, p.IDSheepMale, p.IDSheepFemale, p.MatingDate, p.MatingMethod, p.Status, p.InbreedingFlag, p.CoefficientOfInbreeding, p.Notes, strawCode, inseminator).Scan(&p.IDMating, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	query := `UPDATE breeding.matings SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id_mating = $3 RETURNING id_sheep_female, mating_date`
	var idSheepFemale string
	var matingDate time.Time
	err = tx.QueryRow(ctx, query, status, notes, id).Scan(&idSheepFemale, &matingDate)
	if err != nil {
		return err
	}

	if status == "sukses" {
		// Update sheep status
		updateSheepQuery := `UPDATE livestock.sheep SET status = 'hamil' WHERE id_sheep = $1`
		_, err = tx.Exec(ctx, updateSheepQuery, idSheepFemale)
		if err != nil {
			return err
		}

		// Insert pregnancy
		expectedBirth := matingDate.AddDate(0, 0, 150)
		insertPregnancy := `
			INSERT INTO breeding.pregnancies (id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes)
			VALUES ($1, $2, 'dikandung', $3, 'Otomatis dari pencatatan perkawinan sukses')
			ON CONFLICT DO NOTHING
		`
		_, err = tx.Exec(ctx, insertPregnancy, id, matingDate, expectedBirth)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *Repository) GetAncestors(ctx context.Context, id string, maxGeneration int) (map[string][]int, error) {
	ancestors := make(map[string][]int)
	r.getAncestorsRecursive(ctx, id, 0, maxGeneration, ancestors)
	return ancestors, nil
}

func (r *Repository) getAncestorsRecursive(ctx context.Context, id string, currentGen int, maxGen int, result map[string][]int) {
	if currentGen >= maxGen {
		return
	}

	query := `SELECT id_father, id_mother FROM livestock.sheep WHERE id_sheep = $1`
	var idFather, idMother *string
	err := r.db.QueryRow(ctx, query, id).Scan(&idFather, &idMother)
	if err != nil {
		return
	}

	if idFather != nil && *idFather != "" {
		result[*idFather] = append(result[*idFather], currentGen+1)
		r.getAncestorsRecursive(ctx, *idFather, currentGen+1, maxGen, result)
	}
	if idMother != nil && *idMother != "" {
		result[*idMother] = append(result[*idMother], currentGen+1)
		r.getAncestorsRecursive(ctx, *idMother, currentGen+1, maxGen, result)
	}
}
