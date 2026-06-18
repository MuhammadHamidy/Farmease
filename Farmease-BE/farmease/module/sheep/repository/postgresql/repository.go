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
		       d.id_father, d.id_mother, t.type_name, d.photo_url,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight_date,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight_date
		FROM livestock.sheep d
		LEFT JOIN master.sheep_types t ON d.id_type = t.id_type
		WHERE 1=1`
	
	args := []interface{}{}
	if filter.IDCage != "" {
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
	} else {
		query += " AND d.status != 'eksternal'"
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
		var sheepName, origin, typeName *string
		var idCage, idType *string

		var photoURL *string

		err := rows.Scan(
			&s.IDSheep, &s.SheepCode, &sheepName, &s.Gender, &s.DateOfBirth, &s.Status, &origin, &idCage, &idType,
			&s.IDFather, &s.IDMother, &typeName, &photoURL, &weight, &lastWeightDate, &firstWeight, &firstWeightDate,
		)
		if err != nil {
			return nil, 0, err
		}

		if sheepName != nil { s.SheepName = *sheepName }
		if origin != nil { s.Origin = *origin }
		if typeName != nil { s.TypeName = *typeName }
		if idCage != nil { s.IDCage = *idCage }
		if idType != nil { s.IDType = *idType }
		if photoURL != nil { s.PhotoURL = *photoURL }

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
	countQuery := "SELECT COUNT(*) FROM livestock.sheep d WHERE 1=1"
	countArgs := []interface{}{}
	if filter.IDCage != "" {
		countArgs = append(countArgs, filter.IDCage)
		countQuery += fmt.Sprintf(" AND d.id_cage = $%d", len(countArgs))
	}
	if filter.Gender != "" {
		countArgs = append(countArgs, filter.Gender)
		countQuery += fmt.Sprintf(" AND d.gender = $%d", len(countArgs))
	}
	if filter.Status != "" {
		countArgs = append(countArgs, filter.Status)
		countQuery += fmt.Sprintf(" AND d.status = $%d", len(countArgs))
	} else {
		countQuery += " AND d.status != 'eksternal'"
	}
	if filter.Search != "" {
		countArgs = append(countArgs, "%"+filter.Search+"%")
		countQuery += fmt.Sprintf(" AND (d.sheep_name ILIKE $%d OR d.sheep_code ILIKE $%d)", len(countArgs), len(countArgs))
	}
	err = r.db.QueryRow(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	
	return sheepList, total, nil
}

func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Sheep, error) {
	query := `
		SELECT d.id_sheep, d.sheep_code, d.sheep_name, d.gender, d.date_of_birth, d.status, d.origin, d.id_cage, d.id_type,
		       d.id_father, d.id_mother, t.type_name, d.photo_url,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight_date,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight_date,
		       s.sheep_name as father_name, m.sheep_name as mother_name
		FROM livestock.sheep d
		LEFT JOIN master.sheep_types t ON d.id_type = t.id_type
		LEFT JOIN livestock.sheep s ON d.id_father = s.id_sheep
		LEFT JOIN livestock.sheep m ON d.id_mother = m.id_sheep
		WHERE d.id_sheep = $1`

	var s domain.Sheep
	var weight, firstWeight *float64
	var lastWeightDate, firstWeightDate *time.Time
	var fatherName, motherName *string
	var sheepName, origin, typeName *string
	var idCage, idType *string

	var photoURL *string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&s.IDSheep, &s.SheepCode, &sheepName, &s.Gender, &s.DateOfBirth, &s.Status, &origin, &idCage, &idType,
		&s.IDFather, &s.IDMother, &typeName, &photoURL, &weight, &lastWeightDate, &firstWeight, &firstWeightDate, &fatherName, &motherName,
	)
	if err != nil {
		return nil, err
	}

	if sheepName != nil { s.SheepName = *sheepName }
	if origin != nil { s.Origin = *origin }
	if typeName != nil { s.TypeName = *typeName }
	if idCage != nil { s.IDCage = *idCage }
	if idType != nil { s.IDType = *idType }
	if photoURL != nil { s.PhotoURL = *photoURL }
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
	if s.IDFather != nil && fatherName != nil {
		s.Father = &domain.Parent{IDSheep: *s.IDFather, SheepName: *fatherName}
	}
	if s.IDMother != nil && motherName != nil {
		s.Mother = &domain.Parent{IDSheep: *s.IDMother, SheepName: *motherName}
	}
	return &s, nil
}

func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Sheep, error) {
	query := `SELECT id_sheep, sheep_code, photo_url FROM livestock.sheep WHERE sheep_code = $1`
	var s domain.Sheep
	var photoURL *string
	err := r.db.QueryRow(ctx, query, code).Scan(&s.IDSheep, &s.SheepCode, &photoURL)
	if photoURL != nil { s.PhotoURL = *photoURL }
	return &s, err
}

func (r *Repository) FindExternalDonor(ctx context.Context, name, origin string) (*domain.Sheep, error) {
	query := `SELECT id_sheep, sheep_code, sheep_name, gender, status, origin FROM livestock.sheep WHERE gender = 'jantan' AND status = 'eksternal' AND sheep_name = $1 AND origin = $2 LIMIT 1`
	var s domain.Sheep
	var sName, sOrigin string
	err := r.db.QueryRow(ctx, query, name, origin).Scan(&s.IDSheep, &s.SheepCode, &sName, &s.Gender, &s.Status, &sOrigin)
	if err != nil {
		return nil, err
	}
	s.SheepName = sName
	s.Origin = sOrigin
	return &s, nil
}

func (r *Repository) Store(ctx context.Context, s *domain.Sheep) error {
	query := `
		INSERT INTO livestock.sheep (sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_father, id_mother, photo_url)
		VALUES ($1, $2, $3, $4::DATE, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id_sheep, created_at, updated_at`
	
	var idCage, idType *string
	if s.IDCage != "" {
		idCage = &s.IDCage
	}
	if s.IDType != "" {
		idType = &s.IDType
	}

	return r.db.QueryRow(ctx, query, s.SheepCode, s.SheepName, s.Gender, s.DateOfBirth, s.Status, s.Origin, idCage, idType, s.IDFather, s.IDMother, s.PhotoURL).Scan(&s.IDSheep, &s.CreatedAt, &s.UpdatedAt)
}

func (r *Repository) Update(ctx context.Context, s *domain.Sheep) error {
	query := `
		UPDATE livestock.sheep
		SET sheep_code = $1, sheep_name = $2, gender = $3, date_of_birth = $4::DATE, status = $5, origin = $6, id_cage = $7, id_type = $8, id_father = $9, id_mother = $10, photo_url = COALESCE(NULLIF($11, ''), photo_url), updated_at = CURRENT_TIMESTAMP
		WHERE id_sheep = $12`
	
	var idCage, idType *string
	if s.IDCage != "" {
		idCage = &s.IDCage
	}
	if s.IDType != "" {
		idType = &s.IDType
	}

	_, err := r.db.Exec(ctx, query, s.SheepCode, s.SheepName, s.Gender, s.DateOfBirth, s.Status, s.Origin, idCage, idType, s.IDFather, s.IDMother, s.PhotoURL, s.IDSheep)
	return err
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	query := `UPDATE livestock.sheep SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_sheep = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) GetGenealogy(ctx context.Context, id string, maxGeneration int) (*domain.Genealogy, error) {
	if maxGeneration <= 0 {
		return nil, nil
	}

	query := `SELECT id_sheep, sheep_code, sheep_name, gender, id_father, id_mother FROM livestock.sheep WHERE id_sheep = $1`
	var g domain.Genealogy
	var idFather, idMother *string
	var sheepName *string
	err := r.db.QueryRow(ctx, query, id).Scan(&g.IDSheep, &g.SheepCode, &sheepName, &g.Gender, &idFather, &idMother)
	if err != nil {
		return nil, err
	}

	if sheepName != nil {
		g.SheepName = *sheepName
	}

	if idFather != nil {
		g.Father, _ = r.GetGenealogy(ctx, *idFather, maxGeneration-1)
	}
	if idMother != nil {
		g.Mother, _ = r.GetGenealogy(ctx, *idMother, maxGeneration-1)
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

func (r *Repository) UpdateType(ctx context.Context, id string, t *domain.SheepType) error {
	query := `
		UPDATE master.sheep_types
		SET type_name = $1, type_description = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id_type = $3`
	_, err := r.db.Exec(ctx, query, t.TypeName, t.TypeDescription, id)
	return err
}

