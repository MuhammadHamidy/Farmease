package postgresql

import (
	"context"
	"fmt"

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
		SELECT p.id_mating, p.id_sheep_male, p.id_sheep_female, p.mating_date, p.mating_method, p.status, p.inbreeding_flag, p.coefficient_of_inbreeding, p.notes,
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
		err := rows.Scan(
			&p.IDMating, &p.IDSheepMale, &p.IDSheepFemale, &p.MatingDate, &p.MatingMethod, &p.Status, &p.InbreedingFlag, &p.CoefficientOfInbreeding, &p.Notes,
			&dj.SheepName, &db.SheepName,
		)
		if err != nil {
			return nil, err
		}
		dj.IDSheep = p.IDSheepMale
		db.IDSheep = p.IDSheepFemale
		p.MaleSheep = &dj
		p.FemaleSheep = &db
		list = append(list, &p)
	}
	return list, nil
}

func (r *Repository) FindByID(ctx context.Context, id int) (*domain.Mating, error) {
	query := `
		SELECT p.id_mating, p.id_sheep_male, p.id_sheep_female, p.mating_date, p.mating_method, p.status, p.inbreeding_flag, p.coefficient_of_inbreeding, p.notes,
		       dj.sheep_name as name_male, db.sheep_name as name_female
		FROM breeding.matings p
		JOIN livestock.sheep dj ON p.id_sheep_male = dj.id_sheep
		JOIN livestock.sheep db ON p.id_sheep_female = db.id_sheep
		WHERE p.id_mating = $1`

	var p domain.Mating
	var dj, db domain.SheepShort
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.IDMating, &p.IDSheepMale, &p.IDSheepFemale, &p.MatingDate, &p.MatingMethod, &p.Status, &p.InbreedingFlag, &p.CoefficientOfInbreeding, &p.Notes,
		&dj.SheepName, &db.SheepName,
	)
	if err != nil {
		return nil, err
	}
	dj.IDSheep = p.IDSheepMale
	db.IDSheep = p.IDSheepFemale
	p.MaleSheep = &dj
	p.FemaleSheep = &db
	return &p, nil
}

func (r *Repository) Store(ctx context.Context, p *domain.Mating) error {
	query := `
		INSERT INTO breeding.matings (id_sheep_male, id_sheep_female, mating_date, mating_method, status, inbreeding_flag, coefficient_of_inbreeding, notes)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id_mating, created_at, updated_at`
	return r.db.QueryRow(ctx, query, p.IDSheepMale, p.IDSheepFemale, p.MatingDate, p.MatingMethod, p.Status, p.InbreedingFlag, p.CoefficientOfInbreeding, p.Notes).Scan(&p.IDMating, &p.CreatedAt, &p.UpdatedAt)
}

func (r *Repository) UpdateStatus(ctx context.Context, id int, status string, notes string) error {
	query := `UPDATE breeding.matings SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id_mating = $3`
	_, err := r.db.Exec(ctx, query, status, notes, id)
	return err
}

func (r *Repository) GetAncestors(ctx context.Context, id int, maxGeneration int) (map[int][]int, error) {
	ancestors := make(map[int][]int)
	r.getAncestorsRecursive(ctx, id, 0, maxGeneration, ancestors)
	return ancestors, nil
}

func (r *Repository) getAncestorsRecursive(ctx context.Context, id int, currentGen int, maxGen int, result map[int][]int) {
	if currentGen >= maxGen {
		return
	}

	query := `SELECT id_sire, id_dam FROM livestock.sheep WHERE id_sheep = $1`
	var idSire, idDam *int
	err := r.db.QueryRow(ctx, query, id).Scan(&idSire, &idDam)
	if err != nil {
		return
	}

	if idSire != nil {
		result[*idSire] = append(result[*idSire], currentGen+1)
		r.getAncestorsRecursive(ctx, *idSire, currentGen+1, maxGen, result)
	}
	if idDam != nil {
		result[*idDam] = append(result[*idDam], currentGen+1)
		r.getAncestorsRecursive(ctx, *idDam, currentGen+1, maxGen, result)
	}
}
