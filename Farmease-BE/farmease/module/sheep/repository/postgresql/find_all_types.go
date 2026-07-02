package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

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
