package postgresql

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)




type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}






func (r *Repository) getAncestorsRecursive(ctx context.Context, id string, currentGen int, maxGen int, result map[string][]int) {
	if currentGen >= maxGen {
		return
	}

	query := `SELECT id_father, id_mother FROM livestock.sheep WHERE id_sheep = $1`
	var idFather, idMother *string
	err := r.db.QueryRow(ctx, query, id).Scan(&idFather, &idMother)
	if err != nil {
		return
	}

	if idFather != nil && *idFather != "" {
		result[*idFather] = append(result[*idFather], currentGen+1)
		r.getAncestorsRecursive(ctx, *idFather, currentGen+1, maxGen, result)
	}
	if idMother != nil && *idMother != "" {
		result[*idMother] = append(result[*idMother], currentGen+1)
		r.getAncestorsRecursive(ctx, *idMother, currentGen+1, maxGen, result)
	}
}
