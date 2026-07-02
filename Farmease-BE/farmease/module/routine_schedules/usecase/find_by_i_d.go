package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
)

func (u *useCase) FindByID(ctx context.Context, id string) (*domain.RoutineSchedule, error) {
	return u.repo.FindByID(ctx, id)
}
