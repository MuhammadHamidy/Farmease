package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) UpdateSheep(ctx context.Context, id string, sheep *domain.Sheep) error {
	sheep.IDSheep = id
	return u.repo.Update(ctx, sheep)
}

func (u *useCase) UpdateSheepStatus(ctx context.Context, id string, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}
