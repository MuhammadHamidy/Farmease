package usecase

import (
	"context"
	"fmt"
	"time"
	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

func (u *useCase) CreateSubmission(ctx context.Context, s *domain.Submission) error {
	if s.ApprovalStatus == "" {
		s.ApprovalStatus = "pending"
	}
	if s.SubmittedAt.IsZero() {
		s.SubmittedAt = time.Now()
	}
	if s.SubmissionCode == "" {
		s.SubmissionCode = fmt.Sprintf("SUB-%d", (time.Now().UnixNano()/1e6)%1000000)
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
