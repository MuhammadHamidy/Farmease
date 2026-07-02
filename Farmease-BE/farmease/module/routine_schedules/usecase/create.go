package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (u *useCase) Create(ctx context.Context, rs *domain.RoutineSchedule) error {
	if rs.Priority == "" {
		rs.Priority = "sedang"
	}
	rs.IsActive = true

	// Check for duplicate schedule before saving
	existing, err := u.repo.FindDuplicate(ctx, rs)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("jadwal rutin dengan judul '%s', kategori '%s', frekuensi '%s', dan waktu mulai '%s' sudah ada", rs.Title, rs.Category, rs.Frequency, rs.StartTime)
	}

	err = u.repo.Store(ctx, rs)
	if err != nil {
		return err
	}

	// Generate tasks immediately for the next 30 days synchronously
	// to prevent race condition with UI fetching tasks right after this request
	err = u.GenerateTasksForSchedule(ctx, rs.ID, 30)
	if err != nil {
		// Log error but don't fail the creation
		fmt.Printf("Warning: failed to generate tasks for schedule %s: %v\n", rs.ID, err)
	}

	return nil
}
