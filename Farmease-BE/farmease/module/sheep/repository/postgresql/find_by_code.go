package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// FindByCode retrieves basic details of a sheep by its unique tag code.
func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Sheep, error) {
	query := `SELECT id_sheep, sheep_code, photo_url FROM livestock.sheep WHERE sheep_code = $1`
	var sheep domain.Sheep
	var photoURL *string
	err := r.db.QueryRow(ctx, query, code).Scan(&sheep.IDSheep, &sheep.SheepCode, &photoURL)
	if photoURL != nil { 
		sheep.PhotoURL = *photoURL 
	}
	return &sheep, err
}

// FindExternalDonor retrieves an external sire (ram donor) matching the specified name and origin Balai.
func (r *Repository) FindExternalDonor(ctx context.Context, name, origin string) (*domain.Sheep, error) {
	query := `SELECT id_sheep, sheep_code, sheep_name, gender, status, origin FROM livestock.sheep WHERE gender = 'jantan' AND status = 'eksternal' AND sheep_name = $1 AND origin = $2 LIMIT 1`
	var sheep domain.Sheep
	var sheepName, sheepOrigin string
	err := r.db.QueryRow(ctx, query, name, origin).Scan(&sheep.IDSheep, &sheep.SheepCode, &sheepName, &sheep.Gender, &sheep.Status, &sheepOrigin)
	if err != nil {
		return nil, err
	}
	sheep.SheepName = sheepName
	sheep.Origin = sheepOrigin
	return &sheep, nil
}
