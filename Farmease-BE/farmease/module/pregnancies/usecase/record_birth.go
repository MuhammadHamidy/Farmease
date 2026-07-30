package usecase

import (
	"context"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

// RecordBirth logs a birth event, registers offspring into the sheep records, and sets mother/mating statuses back to active.
func (u *useCase) RecordBirth(ctx context.Context, birth *domain.Birth) error {
	// 1. Get Pregnancy Detail to get parents
	pregnancy, err := u.repo.GetPregnancyDetail(ctx, birth.IDPregnancy)
	if err != nil {
		return err
	}

	// Fetch Mother's details to copy owner and breed type
	mother, err := u.sheepRepo.FindByID(ctx, pregnancy.IDMother)
	motherOwner := ""
	motherType := ""
	if err == nil && mother != nil {
		motherOwner = mother.Owner
		motherType = mother.IDType
	}

	// 2. Store Birth
	err = u.repo.StoreBirth(ctx, birth)
	if err != nil {
		return err
	}

	// 3. Auto-register offspring
	for _, child := range birth.OffspringList {
		newSheep := &sheepDomain.Sheep{
			SheepCode:   child.SheepCode,
			SheepName:   child.SheepName,
			Gender:      child.Gender,
			DateOfBirth: &birth.BirthDate,
			Status:      "aktif",
			Origin:      "internal",
			IDCage:      child.IDCage,
			IDFather:    &pregnancy.IDFather,
			IDMother:    &pregnancy.IDMother,
			Owner:       motherOwner,
			IDType:      motherType,
		}
		err = u.sheepRepo.Store(ctx, newSheep)
		if err == nil && child.BirthWeight > 0 {
			_ = u.repo.StoreBirthWeight(ctx, newSheep.IDSheep, birth.BirthDate, child.BirthWeight)
		}
	}

	// 4. Update Pregnancy status to 'melahirkan'
	_ = u.repo.UpdatePregnancyStatus(ctx, birth.IDPregnancy, "melahirkan", "Kelahiran dicatat")

	// 5. Update Mother's status back to 'aktif'
	_ = u.sheepRepo.UpdateStatus(ctx, pregnancy.IDMother, "aktif", "Selesai melahirkan")

	// 6. Update Mating status back to 'sukses'
	_ = u.matingRepo.UpdateStatus(ctx, pregnancy.IDMating, "sukses", "Selesai melahirkan")

	// 7. Complete task if IDTask is provided
	if birth.IDTask != "" {
		_ = u.taskRepo.UpdateTaskStatus(ctx, birth.IDTask, "selesai")
	}

	return nil
}
