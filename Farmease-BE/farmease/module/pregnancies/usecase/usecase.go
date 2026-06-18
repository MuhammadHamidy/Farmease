package usecase

import (
	"context"
	"fmt"
	"time"

	breedingDomain "github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type useCase struct {
	repo       domain.PregnancyRepository
	sheepRepo  sheepDomain.SheepRepository
	matingRepo breedingDomain.BreedingRepository
	taskRepo   tasksDomain.TaskRepository
}

func NewUseCase(
	repo domain.PregnancyRepository,
	sheepRepo sheepDomain.SheepRepository,
	matingRepo breedingDomain.BreedingRepository,
	taskRepo tasksDomain.TaskRepository,
) domain.UseCase {
	return &useCase{
		repo:       repo,
		sheepRepo:  sheepRepo,
		matingRepo: matingRepo,
		taskRepo:   taskRepo,
	}
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

func (u *useCase) UpdatePregnancyStatus(ctx context.Context, id string, status string, notes string) error {
	err := u.repo.UpdatePregnancyStatus(ctx, id, status, notes)
	if err != nil {
		return err
	}

	if status == "keguguran" {
		// Get pregnancy detail to find mother
		p, err := u.repo.GetPregnancyDetail(ctx, id)
		if err == nil && p != nil {
			u.sheepRepo.UpdateStatus(ctx, p.IDMother, "aktif", "Keguguran")
		}
	}

	return nil
}

func (u *useCase) CheckPregnancy(ctx context.Context, req domain.PregnancyCheckRequest) error {
	// 1. Resolve mating record
	mating, err := u.matingRepo.FindByID(ctx, req.IDMating)
	if err != nil {
		return fmt.Errorf("mating record not found: %w", err)
	}

	// 2. Resolve female sheep record
	femaleSheep, err := u.sheepRepo.FindByID(ctx, mating.IDSheepFemale)
	if err != nil {
		return fmt.Errorf("female sheep not found: %w", err)
	}

	// Gestasi default: 148 days
	expectedBirthDate := mating.MatingDate.AddDate(0, 0, 148)

	switch req.Hasil {
	case "bunting_terkonfirmasi":
		// (a) Create or update breeding.pregnancies (pregnancy_status='dikandung', expected_birth_date = mating_date + 148 days)
		pregnancy := &domain.Pregnancy{
			IDMating:          mating.IDMating,
			PregnancyDate:     req.TanggalPemeriksaan,
			PregnancyStatus:   "dikandung",
			ExpectedBirthDate: &expectedBirthDate,
			Notes:             req.Catatan,
		}
		err = u.repo.StorePregnancy(ctx, pregnancy)
		if err != nil {
			return fmt.Errorf("failed to store pregnancy: %w", err)
		}

		// (b) Set female sheep status to 'hamil'
		err = u.sheepRepo.UpdateStatus(ctx, femaleSheep.IDSheep, "hamil", "Bunting terkonfirmasi")
		if err != nil {
			return fmt.Errorf("failed to update sheep status to hamil: %w", err)
		}

		// (c) Auto-generate task rincian='Pencatatan Kelahiran' at expected_birth_date
		title := "Pencatatan Kelahiran - " + femaleSheep.SheepCode
		if femaleSheep.SheepName != "" {
			title += " (" + femaleSheep.SheepName + ")"
		}
		var cageID *string
		if femaleSheep.IDCage != "" {
			cageID = &femaleSheep.IDCage
		}
		birthTask := &tasksDomain.Task{
			Title:       title,
			Description: fmt.Sprintf("Pencatatan kelahiran untuk induk %s, perkiraan lahir %s", femaleSheep.SheepCode, expectedBirthDate.Format("2006-01-02")),
			TaskDate:    expectedBirthDate,
			Status:      "pending",
			Priority:    "sedang",
			Category:    "kelahiran",
			Rincian:     "Pencatatan Kelahiran",
			IDCage:      cageID,
			IDMating:    &mating.IDMating,
		}
		_ = u.taskRepo.StoreTask(ctx, birthTask)

	case "masih_menunggu":
		// Auto-generate task 'Kontrol Kebuntingan' baru lagi dengan offset 21 hari dari tanggal pemeriksaan ini
		nextTaskDate := req.TanggalPemeriksaan.AddDate(0, 0, 21)
		title := "Kontrol Kebuntingan - " + femaleSheep.SheepCode
		if femaleSheep.SheepName != "" {
			title += " (" + femaleSheep.SheepName + ")"
		}
		var cageID *string
		if femaleSheep.IDCage != "" {
			cageID = &femaleSheep.IDCage
		}
		nextCheckTask := &tasksDomain.Task{
			Title:       title,
			Description: fmt.Sprintf("Pemeriksaan kebuntingan berkala lanjutan setelah hasil masih menunggu pada %s", req.TanggalPemeriksaan.Format("2006-01-02")),
			TaskDate:    nextTaskDate,
			Status:      "pending",
			Priority:    "sedang",
			Category:    "perkawinan",
			Rincian:     "Kontrol Kebuntingan",
			IDCage:      cageID,
			IDMating:    &mating.IDMating,
		}
		_ = u.taskRepo.StoreTask(ctx, nextCheckTask)

	case "gagal":
		// (a) update breeding.matings.status = 'gagal'
		err = u.matingRepo.UpdateStatus(ctx, mating.IDMating, "gagal", "Hasil pemeriksaan: gagal tidak bunting. "+req.Catatan)
		if err != nil {
			return fmt.Errorf("failed to update mating status: %w", err)
		}

		// (b) update female sheep status back to 'aktif'
		err = u.sheepRepo.UpdateStatus(ctx, femaleSheep.IDSheep, "aktif", "Tidak bunting (gagal kawin)")
		if err != nil {
			return fmt.Errorf("failed to update sheep status to aktif: %w", err)
		}

	case "keguguran":
		// (a) update breeding.pregnancies.pregnancy_status = 'keguguran'
		pregnancies, err := u.repo.FindAllPregnancies(ctx, "dikandung")
		if err == nil {
			for _, p := range pregnancies {
				if p.IDMating == mating.IDMating {
					_ = u.repo.UpdatePregnancyStatus(ctx, p.IDPregnancy, "keguguran", "Keguguran pada pemeriksaan: "+req.Catatan)
				}
			}
		}

		// (b) update breeding.matings.status = 'gagal'
		err = u.matingRepo.UpdateStatus(ctx, mating.IDMating, "gagal", "Keguguran. "+req.Catatan)
		if err != nil {
			return fmt.Errorf("failed to update mating status: %w", err)
		}

		// (c) update female sheep status back to 'aktif'
		err = u.sheepRepo.UpdateStatus(ctx, femaleSheep.IDSheep, "aktif", "Keguguran")
		if err != nil {
			return fmt.Errorf("failed to update sheep status to aktif: %w", err)
		}
	}

	// 3. Mark current task (id_task) as completed ('selesai')
	if req.IDTask != "" {
		_ = u.taskRepo.UpdateTaskStatus(ctx, req.IDTask, "selesai")
	}

	return nil
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
			IDFather:    &pregnancy.IDFather,
			IDMother:    &pregnancy.IDMother,
		}
		err = u.sheepRepo.Store(ctx, newSheep)
		if err == nil && child.BirthWeight > 0 {
			_ = u.repo.StoreBirthWeight(ctx, newSheep.IDSheep, k.BirthDate, child.BirthWeight)
		}
	}

	// 4. Update Pregnancy status to 'melahirkan'
	_ = u.repo.UpdatePregnancyStatus(ctx, k.IDPregnancy, "melahirkan", "Kelahiran dicatat")

	// 5. Update Mother's status back to 'aktif'
	_ = u.sheepRepo.UpdateStatus(ctx, pregnancy.IDMother, "aktif", "Selesai melahirkan")

	// 6. Update Mating status back to 'sukses'
	_ = u.matingRepo.UpdateStatus(ctx, pregnancy.IDMating, "sukses", "Selesai melahirkan")

	// 7. Complete task if IDTask is provided
	if k.IDTask != "" {
		_ = u.taskRepo.UpdateTaskStatus(ctx, k.IDTask, "selesai")
	}

	return nil
}

func (u *useCase) GetBirthHistory(ctx context.Context, from, to *time.Time) ([]*domain.Birth, error) {
	return u.repo.FindAllBirths(ctx, from, to)
}
