package usecase

import (
	"context"
	"fmt"
	"time"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

// RecordMating logs a new breeding event (natural mating or artificial insemination)
// and automatically schedules a follow-up pregnancy check (Kontrol Kebuntingan) 21 days later.
func (u *useCase) RecordMating(ctx context.Context, matingData *domain.Mating) error {
	// Resolve female sheep code to UUID if code is passed
	if matingData.IDSheepFemale != "" {
		if femaleSheep, err := u.sheepRepo.FindByCode(ctx, matingData.IDSheepFemale); err == nil && femaleSheep != nil && femaleSheep.IDSheep != "" {
			matingData.IDSheepFemale = femaleSheep.IDSheep
		}
	}
	// Resolve male sheep code to UUID if code is passed
	if matingData.IDSheepMale != "" {
		if maleSheep, err := u.sheepRepo.FindByCode(ctx, matingData.IDSheepMale); err == nil && maleSheep != nil && maleSheep.IDSheep != "" {
			matingData.IDSheepMale = maleSheep.IDSheep
		}
	}

	// Validation checks
	if matingData.IDSheepFemale == "" {
		return fmt.Errorf("domba betina wajib terisi")
	}
	if matingData.MatingMethod == "ib" || matingData.MatingMethod == "inseminasi buatan" {
		if matingData.IDSheepMale == "" && (matingData.ExternalDonor == nil || matingData.ExternalDonor.Name == "") {
			return fmt.Errorf("sumber pejantan (internal atau external donor) wajib terisi untuk inseminasi buatan")
		}
	} else {
		if matingData.IDSheepMale == "" {
			return fmt.Errorf("pejantan wajib terisi untuk kawin alami")
		}
	}

	// 1. If mating is IB and has an external donor, register or find the external donor first
	if (matingData.MatingMethod == "ib" || matingData.MatingMethod == "inseminasi buatan") && matingData.ExternalDonor != nil && matingData.ExternalDonor.Name != "" {
		donor, err := u.sheepRepo.FindExternalDonor(ctx, matingData.ExternalDonor.Name, matingData.ExternalDonor.Origin)
		if err != nil || donor == nil {
			// Generate code DN-YYMMDDHHMMSS
			code := fmt.Sprintf("DN-%s", time.Now().Format("060102150405"))
			donor = &sheepDomain.Sheep{
				SheepCode: code,
				SheepName: matingData.ExternalDonor.Name,
				Gender:    "jantan",
				Status:    "eksternal",
				Origin:    matingData.ExternalDonor.Origin,
			}
			err = u.sheepRepo.Store(ctx, donor)
			if err != nil {
				return err
			}
		}
		matingData.IDSheepMale = donor.IDSheep
	}

	// 2. Fetch female sheep detail to get its cage ID and verify it exists
	femaleSheep, err := u.sheepRepo.FindByID(ctx, matingData.IDSheepFemale)
	if err != nil {
		return err
	}

	// 3. Calculate inbreeding coefficient safely
	checkReq := domain.InbreedingCheckRequest{
		IDSheepMale:   matingData.IDSheepMale,
		IDSheepFemale: matingData.IDSheepFemale,
	}
	inbreedingResponse, err := u.CheckInbreeding(ctx, checkReq)
	if err == nil && inbreedingResponse != nil {
		matingData.InbreedingFlag = inbreedingResponse.InbreedingFlag
		matingData.CoefficientOfInbreeding = inbreedingResponse.CoefficientOfInbreeding
	} else {
		matingData.InbreedingFlag = false
		matingData.CoefficientOfInbreeding = 0.0
	}

	// 4. Save mating record
	err = u.repo.Store(ctx, matingData)
	if err != nil {
		return err
	}

	// 5. Auto-schedule follow-up task "Kontrol Kebuntingan" for 21 days later
	offsetDays := 21
	taskDate := matingData.MatingDate.AddDate(0, 0, offsetDays)

	title := "Kontrol Kebuntingan - " + femaleSheep.SheepCode
	if femaleSheep.SheepName != "" {
		title += " (" + femaleSheep.SheepName + ")"
	}

	var cageIDPtr *string
	if femaleSheep.IDCage != "" {
		cageIDPtr = &femaleSheep.IDCage
	}

	followUpTask := &tasksDomain.Task{
		Title:       title,
		Description: fmt.Sprintf("Pemeriksaan kebuntingan berkala setelah perkawinan tanggal %s", matingData.MatingDate.Format("2006-01-02")),
		TaskDate:    taskDate,
		Status:      "pending",
		Priority:    "sedang",
		Category:    "perkawinan",
		Rincian:     "Kontrol Kebuntingan",
		IDCage:      cageIDPtr,
		IDMating:    &matingData.IDMating,
	}

	_ = u.taskRepo.StoreTask(ctx, followUpTask)

	return nil
}
