package usecase

import (
	"context"
	"fmt"
	"time"
	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

// CreateSubmission registers a new farm operations log (e.g. feeding, sanitization).
func (u *useCase) CreateSubmission(ctx context.Context, submission *domain.Submission) error {
	if submission.ApprovalStatus == "" {
		submission.ApprovalStatus = "pending"
	}
	if submission.SubmittedAt.IsZero() {
		submission.SubmittedAt = time.Now()
	}
	if submission.SubmissionCode == "" {
		submission.SubmissionCode = fmt.Sprintf("SUB-%d", (time.Now().UnixNano()/1e6)%1000000)
	}
	err := u.repo.Store(ctx, submission)
	if err != nil {
		return err
	}

	// Create notification for Admin
	adminID := "11111111-1111-1111-1111-111111111101" // Default Admin account
	notif := &notificationsDomain.Notification{
		Title:        "Pencatatan Baru",
		Message:      fmt.Sprintf("Pencatatan baru '%s' untuk Kandang %s diajukan oleh %s.", submission.TypeLabel, submission.CageCode, submission.OperatorName),
		IsRead:       false,
		IDAccount:    adminID,
		Type:         "submission",
		SubmissionID: &submission.ID,
		TaskID:       submission.TaskID,
	}
	_ = u.notificationRepo.StoreNotification(ctx, notif)
	return nil
}
