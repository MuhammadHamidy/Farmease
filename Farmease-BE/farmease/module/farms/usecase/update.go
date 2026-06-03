package usecase

import (
"context"
"errors"
"time"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/google/uuid"
)

func (u *UseCase) Update(ctx context.Context, id uuid.UUID, farm *domain.Farm) error {
existing, err := u.repo.FindByID(ctx, id)
if err != nil {
return err
}
if existing == nil {
return errors.New("farm not found")
}

if existing.Code != farm.Code {
codeCheck, err := u.repo.FindByCode(ctx, farm.Code)
if err != nil {
return err
}
if codeCheck != nil {
return errors.New("farm code already exists")
}
}

now := time.Now()
existing.Code = farm.Code
existing.Name = farm.Name
existing.Location = farm.Location
existing.Description = farm.Description
existing.UpdatedAt = &now
existing.UpdatedBy = farm.UpdatedBy

return u.repo.Update(ctx, existing)
}
