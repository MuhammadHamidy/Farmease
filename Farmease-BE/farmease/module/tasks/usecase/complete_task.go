package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	submissionsDomain "github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

func (u *useCase) CompleteTask(ctx context.Context, id string) (string, string, error) {
	task, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return "", "", err
	}
	if task == nil {
		return "", "", errors.New("task not found")
	}

	err = u.repo.UpdateTaskStatus(ctx, id, "menunggu")
	if err != nil {
		return "", "", err
	}

	// Cari submission terikat yang berstatus pending
	var existingSub *submissionsDomain.Submission
	subs, err := u.submissionRepo.FindAll(ctx, "all", "")
	if err == nil {
		for _, s := range subs {
			if s.TaskID != nil && *s.TaskID == id {
				existingSub = s
				break
			}
		}
	}

	// Jika belum ada submission yang terbuat, buat baru secara otomatis
	if existingSub == nil {
		cageCode := "A"
		if task.IDCage != nil && *task.IDCage != "" {
			cageCode = *task.IDCage
		}

		existingSub = &submissionsDomain.Submission{
			ID:             id,
			SubmissionCode: "SUB-TASK-" + id[:8],
			Type:           task.Category,
			TypeLabel:      "Laporan Tugas Rutin",
			OperatorCode:   "OP01",
			OperatorName:   "Operator",
			CageCode:       cageCode,
			Scope:          "kandang",
			Summary:        "Menyelesaikan tugas: " + task.Title,
			Payload:        map[string]interface{}{"task_title": task.Title, "description": task.Description},
			SubmittedAt:    time.Now(),
			ApprovalStatus: "pending",
			TaskID:         &id,
		}
		_ = u.submissionRepo.Store(ctx, existingSub)
	}

	// Simpan log aktivitas ke tabel notifikasi
	notif := &notificationsDomain.Notification{
		Title:        "Penyelesaian Tugas",
		Message:      fmt.Sprintf("Tugas '%s' telah diselesaikan dan sedang menunggu persetujuan admin.", task.Title),
		IsRead:       false,
		IDAccount:    task.IDAccount,
		Type:         "task",
		TaskID:       &task.IDTask,
		SubmissionID: &existingSub.ID,
	}
	_ = u.notificationRepo.StoreNotification(ctx, notif)

	return existingSub.ID, existingSub.Summary, nil
}
