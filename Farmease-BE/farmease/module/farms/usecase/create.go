package usecase

import (
"context"
"errors"
"time"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/google/uuid"
)

func (u *UseCase) Create(ctx context.Context, farm *domain.Farm) error {
existing, err := u.repo.FindByCode(ctx, farm.Code)
if err != nil {
return err
}
if existing != nil {
return errors.New("farm code already exists")
}

farm.ID = uuid.New()
farm.CreatedAt = time.Now()

return u.repo.Store(ctx, farm)
}
