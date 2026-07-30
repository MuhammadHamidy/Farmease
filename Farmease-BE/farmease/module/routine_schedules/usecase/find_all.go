package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

// FindAll lists all registered routine schedules.
func (u *useCase) FindAll(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	return u.repo.FindAll(ctx)
}
