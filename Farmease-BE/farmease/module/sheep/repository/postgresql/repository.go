package postgresql

import (
	"context"
	"fmt"
	"time"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll(ctx context.Context, filter domain.SheepFilter) ([]*domain.Sheep, int, error) {
	query := `
		SELECT d.id_sheep, d.sheep_code, d.sheep_name, d.gender, d.date_of_birth, d.status, d.origin, d.id_cage, d.id_type,
		       d.id_sire, d.id_dam, t.type_name,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight_date,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight_date
		FROM livestock.sheep d
		LEFT JOIN master.sheep_types t ON d.id_type = t.id_type
		WHERE 1=1`
	
	args := []interface{}{}
	if filter.IDCage > 0 {
		args = append(args, filter.IDCage)
		query += fmt.Sprintf(" AND d.id_cage = $%d", len(args))
	}
	if filter.Gender != "" {
		args = append(args, filter.Gender)
		query += fmt.Sprintf(" AND d.gender = $%d", len(args))
	}
	if filter.Status != "" {
		args = append(args, filter.Status)
		query += fmt.Sprintf(" AND d.status = $%d", len(args))
	}
	if filter.Search != "" {
		args = append(args, "%"+filter.Search+"%")
		query += fmt.Sprintf(" AND (d.sheep_name ILIKE $%d OR d.sheep_code ILIKE $%d)", len(args), len(args))
	}

	limit := filter.PerPage
	if limit <= 0 {
		limit = 20
	}
	offset := (filter.Page - 1) * limit
	query += fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var sheepList []*domain.Sheep
	for rows.Next() {
		var s domain.Sheep
		var weight, firstWeight *float64
		var lastWeightDate, firstWeightDate *time.Time
		err := rows.Scan(
			&s.IDSheep, &s.SheepCode, &s.SheepName, &s.Gender, &s.DateOfBirth, &s.Status, &s.Origin, &s.IDCage, &s.IDType,
			&s.IDSire, &s.IDDam, &s.TypeName, &weight, &lastWeightDate, &firstWeight, &firstWeightDate,
		)
		if err != nil {
			return nil, 0, err
		}
		if weight != nil {
			s.LastWeight = *weight
		}
		if lastWeightDate != nil {
			s.LastWeightDate = lastWeightDate
		}
		if firstWeight != nil {
			s.FirstWeight = *firstWeight
		}
		if firstWeightDate != nil {
			s.FirstWeightDate = firstWeightDate
		}
		sheepList = append(sheepList, &s)
	}

	var total int
	err = r.db.QueryRow(ctx, "SELECT COUNT(*) FROM livestock.sheep").Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	
	return sheepList, total, nil
}

func (r *Repository) FindByID(ctx context.Context, id int) (*domain.Sheep, error) {
	query := `
		SELECT d.id_sheep, d.sheep_code, d.sheep_name, d.gender, d.date_of_birth, d.status, d.origin, d.id_cage, d.id_type,
		       d.id_sire, d.id_dam, t.type_name,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight_date,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight_date,
		       s.sheep_name as sire_name, m.sheep_name as dam_name
		FROM livestock.sheep d
		LEFT JOIN master.sheep_types t ON d.id_type = t.id_type
		LEFT JOIN livestock.sheep s ON d.id_sire = s.id_sheep
		LEFT JOIN livestock.sheep m ON d.id_dam = m.id_sheep
		WHERE d.id_sheep = $1`

	var s domain.Sheep
	var weight, firstWeight *float64
	var lastWeightDate, firstWeightDate *time.Time
	var sireName, damName *string
	err := r.db.QueryRow(ctx, query, id).Scan(
		&s.IDSheep, &s.SheepCode, &s.SheepName, &s.Gender, &s.DateOfBirth, &s.Status, &s.Origin, &s.IDCage, &s.IDType,
		&s.IDSire, &s.IDDam, &s.TypeName, &weight, &lastWeightDate, &firstWeight, &firstWeightDate, &sireName, &damName,
	)
	if err != nil {
		return nil, err
	}
	if weight != nil {
		s.LastWeight = *weight
	}
	if lastWeightDate != nil {
		s.LastWeightDate = lastWeightDate
	}
	if firstWeight != nil {
		s.FirstWeight = *firstWeight
	}
	if firstWeightDate != nil {
		s.FirstWeightDate = firstWeightDate
	}
	if s.IDSire != nil && sireName != nil {
		s.Sire = &domain.Parent{IDSheep: *s.IDSire, SheepName: *sireName}
	}
	if s.IDDam != nil && damName != nil {
		s.Dam = &domain.Parent{IDSheep: *s.IDDam, SheepName: *damName}
	}
	return &s, nil
}

func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Sheep, error) {
	query := `SELECT id_sheep, sheep_code FROM livestock.sheep WHERE sheep_code = $1`
	var s domain.Sheep
	err := r.db.QueryRow(ctx, query, code).Scan(&s.IDSheep, &s.SheepCode)
	return &s, err
}

func (r *Repository) Store(ctx context.Context, s *domain.Sheep) error {
	query := `
		INSERT INTO livestock.sheep (sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_sire, id_dam)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id_sheep, created_at, updated_at`
	return r.db.QueryRow(ctx, query, s.SheepCode, s.SheepName, s.Gender, s.DateOfBirth, s.Status, s.Origin, s.IDCage, s.IDType, s.IDSire, s.IDDam).Scan(&s.IDSheep, &s.CreatedAt, &s.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, s *domain.Sheep) error {
	query := `
		UPDATE livestock.sheep
		SET sheep_name = $1, id_cage = $2, status = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id_sheep = $4`
	_, err := r.db.Exec(ctx, query, s.SheepName, s.IDCage, s.Status, s.IDSheep)
	return err
}

func (r *Repository) UpdateStatus(ctx context.Context, id int, status string, notes string) error {
	query := `UPDATE livestock.sheep SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_sheep = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) GetGenealogy(ctx context.Context, id int, maxGeneration int) (*domain.Genealogy, error) {
	if maxGeneration <= 0 {
		return nil, nil
	}

	query := `SELECT id_sheep, sheep_name, id_sire, id_dam FROM livestock.sheep WHERE id_sheep = $1`
	var g domain.Genealogy
	var idSire, idDam *int
	err := r.db.QueryRow(ctx, query, id).Scan(&g.IDSheep, &g.SheepName, &idSire, &idDam)
	if err != nil {
		return nil, err
	}

	if idSire != nil {
		g.Sire, _ = r.GetGenealogy(ctx, *idSire, maxGeneration-1)
	}
	if idDam != nil {
		g.Dam, _ = r.GetGenealogy(ctx, *idDam, maxGeneration-1)
	}

	return &g, nil
}

func (r *Repository) FindAllTypes(ctx context.Context) ([]*domain.SheepType, error) {
	query := `SELECT id_type, type_name, type_description, created_at, updated_at FROM master.sheep_types ORDER BY type_name ASC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var types []*domain.SheepType
	for rows.Next() {
		var t domain.SheepType
		err := rows.Scan(&t.IDType, &t.TypeName, &t.TypeDescription, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		types = append(types, &t)
	}
	return types, nil
}

func (r *Repository) StoreType(ctx context.Context, t *domain.SheepType) error {
	query := `
		INSERT INTO master.sheep_types (type_name, type_description)
		VALUES ($1, $2)
		RETURNING id_type, created_at, updated_at`
	return r.db.QueryRow(ctx, query, t.TypeName, t.TypeDescription).Scan(&t.IDType, &t.CreatedAt, &t.UpdatedAt)
}

func (r *Repository) UpdateType(ctx context.Context, id int, t *domain.SheepType) error {
	query := `
		UPDATE master.sheep_types
		SET type_name = $1, type_description = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id_type = $3`
	_, err := r.db.Exec(ctx, query, t.TypeName, t.TypeDescription, id)
	return err
}

