package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)

// UpdateCage updates descriptive properties (e.g. name, type, capacity) of a specific cage.
func (u *useCase) UpdateCage(ctx context.Context, id string, cage *domain.Cage) error {
	cage.IDCage = id
	return u.repo.Update(ctx, cage)
}
