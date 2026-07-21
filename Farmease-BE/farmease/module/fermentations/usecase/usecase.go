package usecase

import (
	feedsDomain "github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
)

type useCase struct {
	repo      domain.FermentationRepository
	feedsRepo feedsDomain.FeedRepository
}

func NewUseCase(repo domain.FermentationRepository, feedsRepo feedsDomain.FeedRepository) domain.UseCase {
	return &useCase{
		repo:      repo,
		feedsRepo: feedsRepo,
	}
}
