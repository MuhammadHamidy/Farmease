package postgresql

import (
	"context"
	"time"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (r *Repository) FindByID(ctx context.Context, id string) (*domain.Sheep, error) {
	query := `
		SELECT d.id_sheep, d.sheep_code, d.sheep_name, d.gender, d.date_of_birth, d.status, d.origin, d.id_cage, d.id_type,
		       d.id_father, d.id_mother, t.type_name, d.photo_url, d.owner,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight_date,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight_date,
		       s.sheep_name as father_name, m.sheep_name as mother_name
		FROM livestock.sheep d
		LEFT JOIN livestock.sheep_types t ON d.id_type = t.id_type
		LEFT JOIN livestock.sheep s ON d.id_father = s.id_sheep
		LEFT JOIN livestock.sheep m ON d.id_mother = m.id_sheep
		WHERE d.id_sheep = $1`

	var s domain.Sheep
	var weight, firstWeight *float64
	var lastWeightDate, firstWeightDate *time.Time
	var fatherName, motherName *string
	var sheepName, origin, typeName *string
	var idCage, idType *string

	var photoURL, owner *string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&s.IDSheep, &s.SheepCode, &sheepName, &s.Gender, &s.DateOfBirth, &s.Status, &origin, &idCage, &idType,
		&s.IDFather, &s.IDMother, &typeName, &photoURL, &owner, &weight, &lastWeightDate, &firstWeight, &firstWeightDate, &fatherName, &motherName,
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
	if owner != nil { s.Owner = *owner }
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
