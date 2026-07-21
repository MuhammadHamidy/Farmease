package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// GetGenealogy resolves a family tree diagram (pedigree) of parents up to maxGeneration recursively, and populates siblings for the target sheep.
func (r *Repository) GetGenealogy(ctx context.Context, id string, maxGeneration int) (*domain.Genealogy, error) {
	genealogy, err := r.getGenealogyRecursive(ctx, id, maxGeneration)
	if err != nil || genealogy == nil {
		return nil, err
	}

	// Fetch siblings of the main sheep if parents are known
	query := `SELECT id_father, id_mother FROM livestock.sheep WHERE id_sheep = $1`
	var idFather, idMother *string
	_ = r.db.QueryRow(ctx, query, id).Scan(&idFather, &idMother)

	if idFather != nil || idMother != nil {
		siblingQuery := `
			SELECT id_sheep, sheep_code, COALESCE(sheep_name, ''), gender, id_father, id_mother
			FROM livestock.sheep
			WHERE id_sheep != $1
			  AND (
				($2::UUID IS NOT NULL AND id_father = $2::UUID)
				OR
				($3::UUID IS NOT NULL AND id_mother = $3::UUID)
			  )
			ORDER BY date_of_birth DESC, created_at DESC
		`
		rows, err := r.db.Query(ctx, siblingQuery, id, idFather, idMother)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var sib domain.Sibling
				var sibFather, sibMother *string
				if err := rows.Scan(&sib.IDSheep, &sib.SheepCode, &sib.SheepName, &sib.Gender, &sibFather, &sibMother); err == nil {
					isSameFather := idFather != nil && sibFather != nil && *idFather == *sibFather
					isSameMother := idMother != nil && sibMother != nil && *idMother == *sibMother
					if isSameFather && isSameMother {
						sib.Type = "kandung"
					} else if isSameFather {
						sib.Type = "tiri_bapak"
					} else if isSameMother {
						sib.Type = "tiri_ibu"
					}
					genealogy.Siblings = append(genealogy.Siblings, sib)
				}
			}
		}
	}

	return genealogy, nil
}

func (r *Repository) getGenealogyRecursive(ctx context.Context, id string, maxGeneration int) (*domain.Genealogy, error) {
	if maxGeneration <= 0 {
		return nil, nil
	}

	query := `SELECT id_sheep, sheep_code, sheep_name, gender, id_father, id_mother FROM livestock.sheep WHERE id_sheep = $1`
	var genealogy domain.Genealogy
	var idFather, idMother *string
	var sheepName *string
	err := r.db.QueryRow(ctx, query, id).Scan(&genealogy.IDSheep, &genealogy.SheepCode, &sheepName, &genealogy.Gender, &idFather, &idMother)
	if err != nil {
		return nil, err
	}

	if sheepName != nil {
		genealogy.SheepName = *sheepName
	}

	if idFather != nil {
		genealogy.Father, _ = r.getGenealogyRecursive(ctx, *idFather, maxGeneration-1)
	}
	if idMother != nil {
		genealogy.Mother, _ = r.getGenealogyRecursive(ctx, *idMother, maxGeneration-1)
	}

	return &genealogy, nil
}
