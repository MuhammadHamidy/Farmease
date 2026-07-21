package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (r *Repository) GetGenealogy(ctx context.Context, id string, maxGeneration int) (*domain.Genealogy, error) {
	if maxGeneration <= 0 {
		return nil, nil
	}

	query := `SELECT id_sheep, sheep_code, sheep_name, gender, id_father, id_mother FROM livestock.sheep WHERE id_sheep = $1`
	var g domain.Genealogy
	var idFather, idMother *string
	var sheepName *string
	err := r.db.QueryRow(ctx, query, id).Scan(&g.IDSheep, &g.SheepCode, &sheepName, &g.Gender, &idFather, &idMother)
	if err != nil {
		return nil, err
	}

	if sheepName != nil {
		g.SheepName = *sheepName
	}

	if idFather != nil {
		g.Father, _ = r.GetGenealogy(ctx, *idFather, maxGeneration-1)
	}
	if idMother != nil {
		g.Mother, _ = r.GetGenealogy(ctx, *idMother, maxGeneration-1)
	}

	return &g, nil
}
