package usecase

import (
"context"
"errors"

"github.com/google/uuid"
)

func (u *UseCase) Delete(ctx context.Context, id uuid.UUID, deletedBy string) error {
existing, err := u.repo.FindByID(ctx, id)
if err != nil {
return err
}
if existing == nil {
return errors.New("farm not found")
}
return u.repo.Delete(ctx, id, deletedBy)
}
