package usecase

import (
	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	submissionsDomain "github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type useCase struct {
	repo             domain.TaskRepository
	notificationRepo notificationsDomain.NotificationRepository
	submissionRepo   submissionsDomain.SubmissionRepository
}

func NewUseCase(
	repo domain.TaskRepository,
	notificationRepo notificationsDomain.NotificationRepository,
	submissionRepo submissionsDomain.SubmissionRepository,
) domain.UseCase {
	return &useCase{
		repo:             repo,
		notificationRepo: notificationRepo,
		submissionRepo:   submissionRepo,
	}
}
