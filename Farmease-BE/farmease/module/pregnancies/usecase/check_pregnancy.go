package usecase

import (
	"context"
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

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
