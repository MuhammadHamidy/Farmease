package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

type useCase struct {
	repo             domain.SubmissionRepository
	notificationRepo notificationsDomain.NotificationRepository
}

func NewUseCase(repo domain.SubmissionRepository, notificationRepo notificationsDomain.NotificationRepository) domain.UseCase {
	return &useCase{
		repo:             repo,
		notificationRepo: notificationRepo,
	}
}

func (u *useCase) GetAllSubmissions(ctx context.Context, status, submissionType string) ([]*domain.Submission, error) {
	return u.repo.FindAll(ctx, status, submissionType)
}

func (u *useCase) GetSubmissionByID(ctx context.Context, id string) (*domain.Submission, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *useCase) CreateSubmission(ctx context.Context, s *domain.Submission) error {
	if s.ApprovalStatus == "" {
		s.ApprovalStatus = "pending"
	}
	if s.SubmittedAt.IsZero() {
		s.SubmittedAt = time.Now()
	}
	err := u.repo.Store(ctx, s)
	if err != nil {
		return err
	}

	// Create notification for Admin
	adminID := "11111111-1111-1111-1111-111111111101" // Default Admin account
	notif := &notificationsDomain.Notification{
		Title:        "Pencatatan Baru",
		Message:      fmt.Sprintf("Pencatatan baru '%s' untuk Kandang %s diajukan oleh %s.", s.TypeLabel, s.CageCode, s.OperatorName),
		IsRead:       false,
		IDAccount:    adminID,
		Type:         "submission",
		SubmissionID: &s.ID,
		TaskID:       s.TaskID,
	}
	_ = u.notificationRepo.StoreNotification(ctx, notif)
	return nil
}

func (u *useCase) UpdateSubmission(ctx context.Context, id string, patch *domain.Submission) error {
	existing, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return nil // or return error not found
	}

	statusChanged := patch.ApprovalStatus != "" && patch.ApprovalStatus != existing.ApprovalStatus

	// Patch existing object
	if patch.Type != "" {
		existing.Type = patch.Type
	}
	if patch.TypeLabel != "" {
		existing.TypeLabel = patch.TypeLabel
	}
	if patch.OperatorCode != "" {
		existing.OperatorCode = patch.OperatorCode
	}
	if patch.OperatorName != "" {
		existing.OperatorName = patch.OperatorName
	}
	if patch.CageCode != "" {
		existing.CageCode = patch.CageCode
	}
	if patch.Scope != "" {
		existing.Scope = patch.Scope
	}
	if patch.Summary != "" {
		existing.Summary = patch.Summary
	}
	if patch.Payload != nil {
		existing.Payload = patch.Payload
	}
	if !patch.SubmittedAt.IsZero() {
		existing.SubmittedAt = patch.SubmittedAt
	}
	if patch.ApprovalStatus != "" {
		existing.ApprovalStatus = patch.ApprovalStatus
	}
	if patch.ReviewedAt != nil {
		existing.ReviewedAt = patch.ReviewedAt
	}
	if patch.ReviewedBy != nil {
		existing.ReviewedBy = patch.ReviewedBy
	}
	if patch.ReviewNote != nil {
		existing.ReviewNote = patch.ReviewNote
	}
	if patch.TaskID != nil {
		existing.TaskID = patch.TaskID
	}

	err = u.repo.Update(ctx, existing)
	if err != nil {
		return err
	}

	if statusChanged {
		// Resolve Operator account ID
		operatorID := "11111111-1111-1111-1111-111111111106" // Default Operator Ternak
		if existing.OperatorCode == "OP002" {
			operatorID = "11111111-1111-1111-1111-111111111105" // Operator Kebun
		}

		statusLabel := "disetujui"
		if existing.ApprovalStatus == "rejected" {
			statusLabel = "ditolak"
		}

		notif := &notificationsDomain.Notification{
			Title:        "Pencatatan " + strings.Title(statusLabel),
			Message:      fmt.Sprintf("Pencatatan '%s' untuk Kandang %s telah %s oleh Admin.", existing.TypeLabel, existing.CageCode, statusLabel),
			IsRead:       false,
			IDAccount:    operatorID,
			Type:         "submission",
			SubmissionID: &existing.ID,
			TaskID:       existing.TaskID,
		}
		_ = u.notificationRepo.StoreNotification(ctx, notif)
	}

	return nil
}

func (u *useCase) DeleteSubmission(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
