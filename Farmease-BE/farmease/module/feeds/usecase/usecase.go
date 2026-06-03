package usecase

import (
	"context"
	"errors"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

type useCase struct {
	repo      domain.FeedRepository
	sheepRepo sheepDomain.SheepRepository
}

func NewUseCase(repo domain.FeedRepository, sheepRepo sheepDomain.SheepRepository) domain.UseCase {
	return &useCase{repo: repo, sheepRepo: sheepRepo}
}

func (u *useCase) GetMasterFeedList(ctx context.Context) ([]*domain.Feed, error) {
	return u.repo.FindAllMaster(ctx)
}

func (u *useCase) AddMasterFeed(ctx context.Context, p *domain.Feed) error {
	return u.repo.StoreMaster(ctx, p)
}

func (u *useCase) UpdateFeedStock(ctx context.Context, id int, amount float64, actionType string) error {
	master, err := u.repo.FindMasterByID(ctx, id)
	if err != nil {
		return err
	}
	if actionType == "kurang" && master.AvailableStock < amount {
		return errors.New("insufficient stock")
	}
	return u.repo.UpdateStock(ctx, id, amount, actionType)
}

func (u *useCase) GetFeedRecommendation(ctx context.Context, idSheep int) (*domain.FeedRecommendation, error) {
	sheep, err := u.sheepRepo.FindByID(ctx, idSheep)
	if err != nil {
		return nil, err
	}

	weight := sheep.LastWeight
	if weight <= 0 {
		weight = 20.0 // Default fallback
	}

	forageKg := weight * 0.10
	concentrateKg := weight * 0.015

	res := &domain.FeedRecommendation{
		IDSheep:            idSheep,
		SheepName:          sheep.SheepName,
		WeightKg:           weight,
		Status:             sheep.Status,
		RekomendasiHarian: []domain.RecommendationItem{
			{Kategori: "hijauan", JumlahKg: forageKg, Keterangan: "10% body weight (fresh forage)"},
			{Kategori: "konsentrat", JumlahKg: concentrateKg, Keterangan: "1.5% body weight"},
		},
		TotalPakanHarianKg: forageKg + concentrateKg,
	}

	return res, nil
}

func (u *useCase) GetFeedRecommendationByCage(ctx context.Context, idCage int) (*domain.CageFeedRecommendation, error) {
	sheepList, _, err := u.sheepRepo.FindAll(ctx, sheepDomain.SheepFilter{
		IDCage:  idCage,
		Page:    1,
		PerPage: 1000,
	})
	if err != nil {
		return nil, err
	}

	var totalForage, totalConcentrate float64
	for _, s := range sheepList {
		weight := s.LastWeight
		if weight <= 0 {
			weight = 20.0
		}
		totalForage += weight * 0.10
		totalConcentrate += weight * 0.015
	}

	return &domain.CageFeedRecommendation{
		IDCage:            idCage,
		JumlahDomba:       len(sheepList),
		TotalHijauanKg:    totalForage,
		TotalKonsentratKg: totalConcentrate,
	}, nil
}

func (u *useCase) RecordFeeding(ctx context.Context, f *domain.Feeding) error {
	// 1. Check stock
	err := u.UpdateFeedStock(ctx, f.IDFeed, f.Amount, "kurang")
	if err != nil {
		return err
	}
	// 2. Store record
	return u.repo.StoreFeeding(ctx, f)
}

func (u *useCase) GetFeedingHistory(ctx context.Context, idSheep int) ([]*domain.Feeding, error) {
	return u.repo.FindFeedingHistory(ctx, idSheep)
}

func (u *useCase) GetFeedingList(ctx context.Context, filter domain.FeedingFilter) ([]*domain.Feeding, int, error) {
	return u.repo.FindAllFeedings(ctx, filter)
}
