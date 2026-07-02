package usecase

import (
	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
)




type useCase struct {
	repo domain.NotificationRepository
}

func NewUseCase(repo domain.NotificationRepository) domain.UseCase {
	return &useCase{repo: repo}
}
