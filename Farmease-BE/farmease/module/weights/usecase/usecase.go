package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
)


type useCase struct {
	repo domain.WeightRepository
}

func NewUseCase(repo domain.WeightRepository) domain.UseCase {
	return &useCase{repo: repo}
}
