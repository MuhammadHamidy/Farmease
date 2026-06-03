package usecase

import (
"context"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
)

func (u *UseCase) FindAll(ctx context.Context, param *domain.FarmParam) ([]*domain.Farm, int, error) {
return u.repo.FindAll(ctx, param)
}
