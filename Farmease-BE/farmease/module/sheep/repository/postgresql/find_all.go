package postgresql

import (
	"context"
	"fmt"
	"time"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// FindAll queries list of sheep with pagination and filters (cage ID, gender, status, search term).
func (r *Repository) FindAll(ctx context.Context, filter domain.SheepFilter) ([]*domain.Sheep, int, error) {
	query := `
		SELECT d.id_sheep, d.sheep_code, d.sheep_name, d.gender, d.date_of_birth, d.status, d.origin, d.id_cage, d.id_type,
		       d.id_father, d.id_mother, t.type_name, d.photo_url, d.owner,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date DESC LIMIT 1) as last_weight_date,
		       (SELECT weight_kg FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight,
		       (SELECT weighing_date FROM livestock.weights WHERE id_sheep = d.id_sheep ORDER BY weighing_date ASC LIMIT 1) as first_weight_date
		FROM livestock.sheep d
		LEFT JOIN livestock.sheep_types t ON d.id_type = t.id_type
		WHERE 1=1`
	
	args := []interface{}{}
	if filter.IDCage != "" {
		args = append(args, filter.IDCage)
		// Accept both cage UUID and cage code (e.g. "K-INDUKAN-01")
		query += fmt.Sprintf(` AND d.id_cage = (SELECT id_cage FROM livestock.cages WHERE cage_code = $%d OR id_cage::text = $%d LIMIT 1)`, len(args), len(args))
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
		limit = 100
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
		var sheep domain.Sheep
		var weight, firstWeight *float64
		var lastWeightDate, firstWeightDate *time.Time
		var sheepName, origin, typeName *string
		var idCage, idType *string
		var photoURL, owner *string

		err := rows.Scan(
			&sheep.IDSheep, &sheep.SheepCode, &sheepName, &sheep.Gender, &sheep.DateOfBirth, &sheep.Status, &origin, &idCage, &idType,
			&sheep.IDFather, &sheep.IDMother, &typeName, &photoURL, &owner, &weight, &lastWeightDate, &firstWeight, &firstWeightDate,
		)
		if err != nil {
			return nil, 0, err
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
		sheepList = append(sheepList, &sheep)
	}

	var total int
	countQuery := "SELECT COUNT(*) FROM livestock.sheep d WHERE 1=1"
	countArgs := []interface{}{}
	if filter.IDCage != "" {
		countArgs = append(countArgs, filter.IDCage)
		countQuery += fmt.Sprintf(` AND d.id_cage = (SELECT id_cage FROM livestock.cages WHERE cage_code = $%d OR id_cage::text = $%d LIMIT 1)`, len(countArgs), len(countArgs))
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
