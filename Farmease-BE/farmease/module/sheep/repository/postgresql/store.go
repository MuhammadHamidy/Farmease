package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// Store creates a new sheep record in the database, resolving cage and type references beforehand.
func (r *Repository) Store(ctx context.Context, sheep *domain.Sheep) error {
	var resolvedCageID string
	if sheep.IDCage != "" {
		err := r.db.QueryRow(ctx, `SELECT id_cage FROM livestock.cages WHERE cage_code = $1 OR id_cage::text = $1 LIMIT 1`, sheep.IDCage).Scan(&resolvedCageID)
		if err == nil && resolvedCageID != "" {
			sheep.IDCage = resolvedCageID
		}
	}

	var resolvedTypeID string
	if sheep.IDType != "" {
		err := r.db.QueryRow(ctx, `SELECT id_type FROM livestock.sheep_types WHERE type_name = $1 OR id_type::text = $1 LIMIT 1`, sheep.IDType).Scan(&resolvedTypeID)
		if err == nil && resolvedTypeID != "" {
			sheep.IDType = resolvedTypeID
		}
	}

	query := `
		INSERT INTO livestock.sheep (sheep_code, sheep_name, gender, date_of_birth, status, origin, id_cage, id_type, id_father, id_mother, photo_url, owner)
		VALUES ($1, $2, $3, $4::DATE, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id_sheep, created_at, updated_at`
	
	var idCage, idType *string
	if sheep.IDCage != "" {
		idCage = &sheep.IDCage
	}
	if sheep.IDType != "" {
		idType = &sheep.IDType
	}

	return r.db.QueryRow(ctx, query, sheep.SheepCode, sheep.SheepName, sheep.Gender, sheep.DateOfBirth, sheep.Status, sheep.Origin, idCage, idType, sheep.IDFather, sheep.IDMother, sheep.PhotoURL, sheep.Owner).Scan(&sheep.IDSheep, &sheep.CreatedAt, &sheep.UpdatedAt)
}

// StoreType creates a new sheep type registry (breed type).
func (r *Repository) StoreType(ctx context.Context, sheepType *domain.SheepType) error {
	query := `
		INSERT INTO livestock.sheep_types (type_name, type_description)
		VALUES ($1, $2)
		RETURNING id_type, created_at, updated_at`
	return r.db.QueryRow(ctx, query, sheepType.TypeName, sheepType.TypeDescription).Scan(&sheepType.IDType, &sheepType.CreatedAt, &sheepType.UpdatedAt)
}
