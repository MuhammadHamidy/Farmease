package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (u *useCase) FindAll(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	return u.repo.FindAll(ctx)
}
