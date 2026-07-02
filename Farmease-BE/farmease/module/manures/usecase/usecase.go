package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
)


type useCase struct {
	repo domain.ManureRepository
}

func NewUseCase(repo domain.ManureRepository) domain.UseCase {
	return &useCase{repo: repo}
}
