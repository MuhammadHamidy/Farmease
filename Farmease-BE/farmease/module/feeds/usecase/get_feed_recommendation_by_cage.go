package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) GetFeedRecommendationByCage(ctx context.Context, idCage string) (*domain.CageFeedRecommendation, error) {
	sheepList, _, err := u.sheepRepo.FindAll(ctx, sheepDomain.SheepFilter{
		IDCage:  idCage,
		Page:    1,
		PerPage: 1000,
	})
	if err != nil {
		return nil, err
	}

	availableFeeds, err := u.repo.FindAllMaster(ctx)
	if err != nil {
		availableFeeds = []*domain.Feed{}
	}

	var totalForage, totalConcentrate float64
	for _, s := range sheepList {
		weight := s.LastWeight
		if weight <= 0 {
			weight = 30.0
		}
		
		recs, _ := calculateSingleRecommendation(weight, availableFeeds)
		for _, item := range recs {
			if item.Kategori == "hijauan" {
				totalForage += item.JumlahKg
			} else {
				totalConcentrate += item.JumlahKg
			}
		}
	}

	return &domain.CageFeedRecommendation{
		IDCage:            idCage,
		JumlahDomba:       len(sheepList),
		TotalHijauanKg:    totalForage,
		TotalKonsentratKg: totalConcentrate,
	}, nil
}
