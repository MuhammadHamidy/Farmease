package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
	"github.com/farmease/farmease-be/libraries/publisher"
)

type useCase struct {
	repo      domain.ManureRepository
	publisher *publisher.Publisher
}

func NewUseCase(repo domain.ManureRepository, pub *publisher.Publisher) domain.UseCase {
	return &useCase{
		repo:      repo,
		publisher: pub,
	}
}
