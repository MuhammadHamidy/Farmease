package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)


type useCase struct {
	repo domain.SheepRepository
}

func NewUseCase(repo domain.SheepRepository) domain.UseCase {
	return &useCase{repo: repo}
}
