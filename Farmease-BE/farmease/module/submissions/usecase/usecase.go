package usecase

import (
	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type useCase struct {
	repo             domain.SubmissionRepository
	notificationRepo notificationsDomain.NotificationRepository
	taskRepo         tasksDomain.TaskRepository
}

func NewUseCase(
	repo domain.SubmissionRepository,
	notificationRepo notificationsDomain.NotificationRepository,
	taskRepo tasksDomain.TaskRepository,
) domain.UseCase {
	return &useCase{
		repo:             repo,
		notificationRepo: notificationRepo,
		taskRepo:         taskRepo,
	}
}
