package postgresql

import (
	"context"
	"time"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// FindByID queries the complete record details of a sheep by UUID, including parent names, cage ID, and growth weights.
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

	var sheep domain.Sheep
	var weight, firstWeight *float64
	var lastWeightDate, firstWeightDate *time.Time
	var fatherName, motherName *string
	var sheepName, origin, typeName *string
	var idCage, idType *string
	var photoURL, owner *string

	err := r.db.QueryRow(ctx, query, id).Scan(
		&sheep.IDSheep, &sheep.SheepCode, &sheepName, &sheep.Gender, &sheep.DateOfBirth, &sheep.Status, &origin, &idCage, &idType,
		&sheep.IDFather, &sheep.IDMother, &typeName, &photoURL, &owner, &weight, &lastWeightDate, &firstWeight, &firstWeightDate, &fatherName, &motherName,
	)
	if err != nil {
		return nil, err
	}

	if sheepName != nil { 
		sheep.SheepName = *sheepName 
	}
	if origin != nil { 
		sheep.Origin = *origin 
	}
	if typeName != nil { 
		sheep.TypeName = *typeName 
	}
	if idCage != nil { 
		sheep.IDCage = *idCage 
	}
	if idType != nil { 
		sheep.IDType = *idType 
	}
	if photoURL != nil { 
		sheep.PhotoURL = *photoURL 
	}
	if owner != nil { 
		sheep.Owner = *owner 
	}
	if weight != nil {
		sheep.LastWeight = *weight
	}
	if lastWeightDate != nil {
		sheep.LastWeightDate = lastWeightDate
	}
	if firstWeight != nil {
		sheep.FirstWeight = *firstWeight
	}
	if firstWeightDate != nil {
		sheep.FirstWeightDate = firstWeightDate
	}
	if sheep.IDFather != nil && fatherName != nil {
		sheep.Father = &domain.Parent{IDSheep: *sheep.IDFather, SheepName: *fatherName}
	}
	if sheep.IDMother != nil && motherName != nil {
		sheep.Mother = &domain.Parent{IDSheep: *sheep.IDMother, SheepName: *motherName}
	}
	return &sheep, nil
}
