package usecase

import (
"github.com/farmease/farmease-be/farmease/module/farms/domain"
)

var _ domain.UseCase = (*UseCase)(nil)

type UseCase struct {
repo domain.FarmRepository
}

func NewUseCase(repo domain.FarmRepository) *UseCase {
return &UseCase{repo: repo}
}
