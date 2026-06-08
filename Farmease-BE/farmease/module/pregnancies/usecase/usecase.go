package usecase

import (
	"context"
	"time"

	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

type useCase struct {
	repo      domain.PregnancyRepository
	sheepRepo sheepDomain.SheepRepository
}

func NewUseCase(repo domain.PregnancyRepository, sheepRepo sheepDomain.SheepRepository) domain.UseCase {
	return &useCase{repo: repo, sheepRepo: sheepRepo}
}

func (u *useCase) RecordPregnancy(ctx context.Context, k *domain.Pregnancy) error {
	return u.repo.StorePregnancy(ctx, k)
}

func (u *useCase) GetPregnancyList(ctx context.Context, status string) ([]*domain.Pregnancy, error) {
	list, err := u.repo.FindAllPregnancies(ctx, status)
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	for _, p := range list {
		if p.ExpectedBirthDate != nil {
			hours := p.ExpectedBirthDate.Sub(now).Hours()
			p.DaysRemaining = int((hours / 24.0) + 0.99)
		}
	}
	
	return list, nil
}

func (u *useCase) UpdatePregnancyStatus(ctx context.Context, id int, status string, notes string) error {
	return u.repo.UpdatePregnancyStatus(ctx, id, status, notes)
}

func (u *useCase) RecordBirth(ctx context.Context, k *domain.Birth) error {
	// 1. Get Pregnancy Detail to get parents
	pregnancy, err := u.repo.GetPregnancyDetail(ctx, k.IDPregnancy)
	if err != nil {
		return err
	}

	// 2. Store Birth
	err = u.repo.StoreBirth(ctx, k)
	if err != nil {
		return err
	}

	// 3. Auto-register offspring
	for _, child := range k.OffspringList {
		newSheep := &sheepDomain.Sheep{
			SheepCode:   child.SheepCode,
			SheepName:   child.SheepName,
			Gender:      child.Gender,
			DateOfBirth: &k.BirthDate,
			Status:      "aktif",
			Origin:      "internal",
			IDCage:      child.IDCage,
			IDSire:      &pregnancy.IDSire,
			IDDam:       &pregnancy.IDDam,
		}
		err = u.sheepRepo.Store(ctx, newSheep)
		if err == nil && child.BirthWeight > 0 {
			u.repo.StoreBirthWeight(ctx, newSheep.IDSheep, k.BirthDate, child.BirthWeight)
		}
	}

	// 4. Update Pregnancy status to 'lahir'
	u.repo.UpdatePregnancyStatus(ctx, k.IDPregnancy, "lahir", "Kelahiran dicatat")

	return nil
}

func (u *useCase) GetBirthHistory(ctx context.Context, from, to *time.Time) ([]*domain.Birth, error) {
	return u.repo.FindAllBirths(ctx, from, to)
}
