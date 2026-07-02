package usecase

import (
	"context"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) GetSheepList(ctx context.Context, filter domain.SheepFilter) ([]*domain.Sheep, int, error) {
	sheepList, total, err := u.repo.FindAll(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	// Retrieve mating status data once for batch calculation
	activeMatingFemales, pendingMatingSheeps, latestEstrusChecks, _ := u.repo.GetMatingStatusData(ctx)

	// Calculate age, ADG, and mating readiness for each sheep
	for _, sheep := range sheepList {
		sheep.CalculateAge()
		sheep.CalculateADG()
		u.CalculateMatingReadiness(sheep, activeMatingFemales, pendingMatingSheeps, latestEstrusChecks)
	}

	return sheepList, total, nil
}
