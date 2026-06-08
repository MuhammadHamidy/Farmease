package postgresql

import (
	"context"
	"time"

	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAllPregnancies(ctx context.Context, status string) ([]*domain.Pregnancy, error) {
	query := `
		SELECT k.id_pregnancy, k.id_mating, k.pregnancy_date, k.pregnancy_status, k.expected_birth_date, k.notes,
		       d.id_sheep, d.sheep_name
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
		err := rows.Scan(&k.IDPregnancy, &k.IDMating, &k.PregnancyDate, &k.PregnancyStatus, &k.ExpectedBirthDate, &k.Notes, &d.IDSheep, &d.SheepName)
		if err != nil {
			return nil, err
		}
		k.DamSheep = &d
		list = append(list, &k)
	}
	return list, nil
}

func (r *Repository) StorePregnancy(ctx context.Context, k *domain.Pregnancy) error {
	query := `
		INSERT INTO breeding.pregnancies (id_mating, pregnancy_date, pregnancy_status, expected_birth_date, notes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_pregnancy, created_at, updated_at`
	return r.db.QueryRow(ctx, query, k.IDMating, k.PregnancyDate, k.PregnancyStatus, k.ExpectedBirthDate, k.Notes).Scan(&k.IDPregnancy, &k.CreatedAt, &k.UpdatedAt)
}

func (r *Repository) UpdatePregnancyStatus(ctx context.Context, id int, status string, notes string) error {
	query := `UPDATE breeding.pregnancies SET pregnancy_status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id_pregnancy = $3`
	_, err := r.db.Exec(ctx, query, status, notes, id)
	return err
}

func (r *Repository) StoreBirth(ctx context.Context, k *domain.Birth) error {
	query := `
		INSERT INTO breeding.births (id_pregnancy, birth_date, number_of_offspring, offspring_gender, offspring_condition, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id_birth, created_at`
	return r.db.QueryRow(ctx, query, k.IDPregnancy, k.BirthDate, k.NumberOfOffspring, k.OffspringGender, k.OffspringCondition, k.Notes).Scan(&k.IDBirth, &k.CreatedAt)
}

func (r *Repository) StoreBirthWeight(ctx context.Context, idSheep int, date time.Time, weight float64) error {
	query := `
		INSERT INTO livestock.weights (id_sheep, weighing_date, weight_kg, notes)
		VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(ctx, query, idSheep, date, weight, "Berat Lahir")
	return err
}

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

func (r *Repository) GetPregnancyDetail(ctx context.Context, id int) (*domain.Pregnancy, error) {
	query := `
		SELECT k.id_pregnancy, k.id_mating, k.pregnancy_date, k.pregnancy_status, k.expected_birth_date, k.notes,
		       p.id_sheep_male, p.id_sheep_female
		FROM breeding.pregnancies k
		JOIN breeding.matings p ON k.id_mating = p.id_mating
		WHERE k.id_pregnancy = $1`
	
	var k domain.Pregnancy
	err := r.db.QueryRow(ctx, query, id).Scan(&k.IDPregnancy, &k.IDMating, &k.PregnancyDate, &k.PregnancyStatus, &k.ExpectedBirthDate, &k.Notes, &k.IDSire, &k.IDDam)
	if err != nil {
		return nil, err
	}
	return &k, nil
}
