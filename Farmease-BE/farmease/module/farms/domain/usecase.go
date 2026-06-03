package domain

import (
"context"

"github.com/google/uuid"
)

type UseCase interface {
Create(ctx context.Context, farm *Farm) error
FindAll(ctx context.Context, param *FarmParam) ([]*Farm, int, error)
FindByID(ctx context.Context, id uuid.UUID) (*Farm, error)
Update(ctx context.Context, id uuid.UUID, farm *Farm) error
Delete(ctx context.Context, id uuid.UUID, deletedBy string) error
}
