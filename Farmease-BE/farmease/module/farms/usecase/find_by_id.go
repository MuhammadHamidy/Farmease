package usecase

import (
"context"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/google/uuid"
)

func (u *UseCase) FindByID(ctx context.Context, id uuid.UUID) (*domain.Farm, error) {
return u.repo.FindByID(ctx, id)
}
