package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (r *Repository) Update(ctx context.Context, s *domain.Sheep) error {
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
		UPDATE livestock.sheep
		SET sheep_code = $1, sheep_name = $2, gender = $3, date_of_birth = $4::DATE, status = $5, origin = $6, id_cage = $7, id_type = $8, id_father = $9, id_mother = $10, photo_url = COALESCE(NULLIF($11, ''), photo_url), owner = $12, updated_at = CURRENT_TIMESTAMP
		WHERE id_sheep = $13`
	
	var idCage, idType *string
	if s.IDCage != "" {
		idCage = &s.IDCage
	}
	if s.IDType != "" {
		idType = &s.IDType
	}

	_, err := r.db.Exec(ctx, query, s.SheepCode, s.SheepName, s.Gender, s.DateOfBirth, s.Status, s.Origin, idCage, idType, s.IDFather, s.IDMother, s.PhotoURL, s.Owner, s.IDSheep)
	return err
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status string, notes string) error {
	query := `UPDATE livestock.sheep SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_sheep = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) UpdateType(ctx context.Context, id string, t *domain.SheepType) error {
	query := `
		UPDATE livestock.sheep_types
		SET type_name = $1, type_description = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id_type = $3`
	_, err := r.db.Exec(ctx, query, t.TypeName, t.TypeDescription, id)
	return err
}
