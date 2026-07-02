package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
)


type useCase struct {
	repo domain.HealthRepository
}

func NewUseCase(repo domain.HealthRepository) domain.UseCase {
	return &useCase{repo: repo}
}
