package postgresql

import (
"context"
"fmt"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
)

func (r *Repository) FindAll(ctx context.Context, param *domain.FarmParam) ([]*domain.Farm, int, error) {
query := `SELECT id, code, name, location, description, created_at, created_by, updated_at, updated_by FROM farms WHERE deleted_at IS NULL`
args := []interface{}{}
idx := 1

if param.Code != "" {
query += fmt.Sprintf(" AND code ILIKE $%d", idx)
args = append(args, "%"+param.Code+"%")
idx++
}
if param.Name != "" {
query += fmt.Sprintf(" AND name ILIKE $%d", idx)
args = append(args, "%"+param.Name+"%")
idx++
}

countQuery := `SELECT COUNT(*) FROM (` + query + `) t`
var total int
if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
return nil, 0, err
}

if param.Limit > 0 {
query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", idx, idx+1)
args = append(args, param.Limit, param.Offset)
}

rows, err := r.db.Query(ctx, query, args...)
if err != nil {
return nil, 0, err
}
defer rows.Close()

var farms []*domain.Farm
for rows.Next() {
var f domain.Farm
if err := rows.Scan(&f.ID, &f.Code, &f.Name, &f.Location, &f.Description, &f.CreatedAt, &f.CreatedBy, &f.UpdatedAt, &f.UpdatedBy); err != nil {
return nil, 0, err
}
farms = append(farms, &f)
}
return farms, total, nil
}
