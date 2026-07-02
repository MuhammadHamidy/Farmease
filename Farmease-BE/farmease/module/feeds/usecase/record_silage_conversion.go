package usecase

import (
	"context"
	"fmt"
	"time"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

func (u *useCase) RecordSilageConversion(ctx context.Context, sc *domain.SilageConversion) error {
	for _, d := range sc.Details {
		if _, err := u.UpdateFeedStock(ctx, d.IDFeed, d.Amount, "kurang"); err != nil {
			return fmt.Errorf("gagal memotong stok bahan baku %s: %w", d.IDFeed, err)
		}
	}

	// Create operator checking task scheduled for 7 days post-conversion
	operatorID := "11111111-1111-1111-1111-111111111106" // Default Operator Ternak
	checkTask := &tasksDomain.Task{
		Title:       "Pengecekan Fermentasi Silase",
		Description: fmt.Sprintf("Lakukan pengecekan kualitas fermentasi pakan silase (Target: %.2f %s, Tanggal Konversi: %s)", sc.TargetAmount, sc.Unit, time.Now().Format("2006-01-02")),
		TaskDate:    time.Now().AddDate(0, 0, 7), // 7 days from now
		Status:      "belum",
		Priority:    "sedang",
		Category:    "pakan",
		Rincian:     "Konversi Pakan",
		IDAccount:   operatorID,
	}
	_ = u.taskRepo.StoreTask(ctx, checkTask)

	return u.repo.StoreSilageConversion(ctx, sc)
}
