package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// FindAllTypes retrieves all registered sheep breed types ordered alphabetically by name.
func (r *Repository) FindAllTypes(ctx context.Context) ([]*domain.SheepType, error) {
	query := `SELECT id_type, type_name, type_description, created_at, updated_at FROM livestock.sheep_types ORDER BY type_name ASC`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sheepTypeList []*domain.SheepType
	for rows.Next() {
		var sheepType domain.SheepType
		err := rows.Scan(&sheepType.IDType, &sheepType.TypeName, &sheepType.TypeDescription, &sheepType.CreatedAt, &sheepType.UpdatedAt)
		if err != nil {
			return nil, err
		}
		sheepTypeList = append(sheepTypeList, &sheepType)
	}
	return sheepTypeList, nil
}
