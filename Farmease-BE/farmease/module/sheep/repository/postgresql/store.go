package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (r *Repository) Store(ctx context.Context, s *domain.Sheep) error {
	var resolvedCageID string
	if s.IDCage != "" {
		err := r.db.QueryRow(ctx, `SELECT id_cage FROM livestock.cages WHERE cage_code = $1 OR id_cage::text = $1 LIMIT 1`, s.IDCage).Scan(&resolvedCageID)
		if err == nil && resolvedCageID != "" {
			s.IDCage = resolvedCageID
		}
	}

	var resolvedTypeID string
	if s.IDType != "" {
		err := r.db.QueryRow(ctx, `SELECT id_type FROM livestock.sheep_types WHERE type_name = $1 OR id_type::text = $1 LIMIT 1`, s.IDType).Scan(&resolvedTypeID)
		if err == nil && resolvedTypeID != "" {
			s.IDType = resolvedTypeID
		}
	}

	query := `
		INSERT INTO livestock.sheep (sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_father, id_mother, photo_url, owner)
		VALUES ($1, $2, $3, $4::DATE, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id_sheep, created_at, updated_at`
	
	var idCage, idType *string
	if s.IDCage != "" {
		idCage = &s.IDCage
	}
	if s.IDType != "" {
		idType = &s.IDType
	}

	return r.db.QueryRow(ctx, query, s.SheepCode, s.SheepName, s.Gender, s.DateOfBirth, s.Status, s.Origin, idCage, idType, s.IDFather, s.IDMother, s.PhotoURL, s.Owner).Scan(&s.IDSheep, &s.CreatedAt, &s.UpdatedAt)
}

func (r *Repository) StoreType(ctx context.Context, t *domain.SheepType) error {
	query := `
		INSERT INTO livestock.sheep_types (type_name, type_description)
		VALUES ($1, $2)
		RETURNING id_type, created_at, updated_at`
	return r.db.QueryRow(ctx, query, t.TypeName, t.TypeDescription).Scan(&t.IDType, &t.CreatedAt, &t.UpdatedAt)
}
