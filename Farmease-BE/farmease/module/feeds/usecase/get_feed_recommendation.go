package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) GetFeedRecommendation(ctx context.Context, idSheep string) (*domain.FeedRecommendation, error) {
	var sheep *sheepDomain.Sheep
	var err error

	if isValidUUID(idSheep) {
		sheep, err = u.sheepRepo.FindByID(ctx, idSheep)
		if err != nil {
			// Fallback to searching by sheep code in case the UUID is actually a code (though unlikely for 36 chars)
			codeSheep, errCode := u.sheepRepo.FindByCode(ctx, idSheep)
			if errCode == nil {
				sheep, err = u.sheepRepo.FindByID(ctx, codeSheep.IDSheep)
			}
		}
	} else {
		// It's a code, search by code directly
		codeSheep, errCode := u.sheepRepo.FindByCode(ctx, idSheep)
		if errCode != nil {
			return nil, fmt.Errorf("failed to find sheep by code (%s): %w", idSheep, errCode)
		}
		sheep, err = u.sheepRepo.FindByID(ctx, codeSheep.IDSheep)
	}

	if err != nil {
		return nil, err
	}

	weight := sheep.LastWeight
	if weight <= 0 {
		weight = 30.0 // Default fallback
	}

	availableFeeds, err := u.repo.FindAllMaster(ctx)
	if err != nil {
		availableFeeds = []*domain.Feed{}
	}

	recs, totalFreshWeight := calculateSingleRecommendation(weight, availableFeeds)

	return &domain.FeedRecommendation{
		IDSheep:            sheep.IDSheep, // Return the actual UUID of the sheep
		SheepName:          sheep.SheepName,
		WeightKg:           weight,
		Status:             sheep.Status,
		RekomendasiHarian:  recs,
		TotalPakanHarianKg: totalFreshWeight,
	}, nil
}
