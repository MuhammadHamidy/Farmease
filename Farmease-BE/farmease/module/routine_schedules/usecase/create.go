package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// Create registers a new routine schedule and triggers task generation for the next 30 days.
func (u *useCase) Create(ctx context.Context, routineSchedule *domain.RoutineSchedule) error {
	if routineSchedule.Priority == "" {
		routineSchedule.Priority = "sedang"
	}
	routineSchedule.IsActive = true

	// Check for duplicate schedule before saving
	existing, err := u.repo.FindDuplicate(ctx, routineSchedule)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("jadwal rutin dengan judul '%s', kategori '%s', frekuensi '%s', dan waktu mulai '%s' sudah ada", routineSchedule.Title, routineSchedule.Category, routineSchedule.Frequency, routineSchedule.StartTime)
	}

	err = u.repo.Store(ctx, routineSchedule)
	if err != nil {
		return err
	}

	// Generate tasks immediately for the next 30 days synchronously
	err = u.GenerateTasksForSchedule(ctx, routineSchedule.ID, 30)
	if err != nil {
		fmt.Printf("Warning: failed to generate tasks for schedule %s: %v\n", routineSchedule.ID, err)
	}

	return nil
}
