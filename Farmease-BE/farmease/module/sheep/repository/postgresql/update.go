package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// Update updates descriptive properties of a sheep in the database, resolving associations beforehand.
func (r *Repository) Update(ctx context.Context, sheep *domain.Sheep) error {
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
		UPDATE livestock.sheep
		SET sheep_code = $1, sheep_name = $2, gender = $3, date_of_birth = $4::DATE, status = $5, origin = $6, id_cage = $7, id_type = $8, id_father = $9, id_mother = $10, photo_url = COALESCE(NULLIF($11, ''), photo_url), owner = $12, updated_at = CURRENT_TIMESTAMP
		WHERE id_sheep = $13`
	
	var idCage, idType *string
	if sheep.IDCage != "" {
		idCage = &sheep.IDCage
	}
	if sheep.IDType != "" {
		idType = &sheep.IDType
	}

	_, err := r.db.Exec(ctx, query, sheep.SheepCode, sheep.SheepName, sheep.Gender, sheep.DateOfBirth, sheep.Status, sheep.Origin, idCage, idType, sheep.IDFather, sheep.IDMother, sheep.PhotoURL, sheep.Owner, sheep.IDSheep)
	return err
}

// UpdateStatus changes the active state/status of a sheep.
func (r *Repository) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	query := `UPDATE livestock.sheep SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_sheep = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

// UpdateType modifies the registration meta properties of a breed type.
func (r *Repository) UpdateType(ctx context.Context, id string, sheepType *domain.SheepType) error {
	query := `
		UPDATE livestock.sheep_types
		SET type_name = $1, type_description = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id_type = $3`
	_, err := r.db.Exec(ctx, query, sheepType.TypeName, sheepType.TypeDescription, id)
	return err
}
