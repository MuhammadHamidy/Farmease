package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) GetSheepDetail(ctx context.Context, id string) (*domain.Sheep, error) {
	sheep, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Retrieve mating status data
	activeMatingFemales, pendingMatingSheeps, latestEstrusChecks, _ := u.repo.GetMatingStatusData(ctx)

	// Calculate age, ADG, and mating readiness
	sheep.CalculateAge()
	sheep.CalculateADG()
	u.CalculateMatingReadiness(sheep, activeMatingFemales, pendingMatingSheeps, latestEstrusChecks)

	return sheep, nil
}
