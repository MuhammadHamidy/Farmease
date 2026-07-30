package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// FindByID retrieves details of a single routine schedule by ID.
func (u *useCase) FindByID(ctx context.Context, id string) (*domain.RoutineSchedule, error) {
	return u.repo.FindByID(ctx, id)
}
