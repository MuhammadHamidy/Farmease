package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
)


type useCase struct {
	repo domain.CageRepository
}

func NewUseCase(repo domain.CageRepository) domain.UseCase {
	return &useCase{repo: repo}
}
