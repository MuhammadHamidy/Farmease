package postgresql

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (r *Repository) FindByCode(ctx context.Context, code string) (*domain.Sheep, error) {
	query := `SELECT id_sheep, sheep_code, photo_url FROM livestock.sheep WHERE sheep_code = $1`
	var s domain.Sheep
	var photoURL *string
	err := r.db.QueryRow(ctx, query, code).Scan(&s.IDSheep, &s.SheepCode, &photoURL)
	if photoURL != nil { s.PhotoURL = *photoURL }
	return &s, err
}

func (r *Repository) FindExternalDonor(ctx context.Context, name, origin string) (*domain.Sheep, error) {
	query := `SELECT id_sheep, sheep_code, sheep_name, gender, status, origin FROM livestock.sheep WHERE gender = 'jantan' AND status = 'eksternal' AND sheep_name = $1 AND origin = $2 LIMIT 1`
	var s domain.Sheep
	var sName, sOrigin string
	err := r.db.QueryRow(ctx, query, name, origin).Scan(&s.IDSheep, &s.SheepCode, &sName, &s.Gender, &s.Status, &sOrigin)
	if err != nil {
		return nil, err
	}
	s.SheepName = sName
	s.Origin = sOrigin
	return &s, nil
}
