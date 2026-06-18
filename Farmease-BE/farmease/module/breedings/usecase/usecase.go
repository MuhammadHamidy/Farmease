package usecase

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type useCase struct {
	repo      domain.BreedingRepository
	sheepRepo sheepDomain.SheepRepository
	taskRepo  tasksDomain.TaskRepository
}

func NewUseCase(
	repo domain.BreedingRepository,
	sheepRepo sheepDomain.SheepRepository,
	taskRepo tasksDomain.TaskRepository,
) domain.UseCase {
	return &useCase{
		repo:      repo,
		sheepRepo: sheepRepo,
		taskRepo:  taskRepo,
	}
}

func (u *useCase) CheckInbreeding(ctx context.Context, req domain.InbreedingCheckRequest) (*domain.InbreedingCheckResponse, error) {
	if req.IDSheepMale == "" || req.IDSheepFemale == "" {
		return &domain.InbreedingCheckResponse{
			IDMale:                  req.IDSheepMale,
			IDFemale:                req.IDSheepFemale,
			CoefficientOfInbreeding: 0.0,
			InbreedingPercentage:    0.0,
			InbreedingFlag:          false,
			RiskCategory:            "Sangat Rendah",
			RiskLevel:               "safe",
			Recommendation:          "Sangat aman. Hubungan kekerabatan jauh atau tidak ada.",
		}, nil
	}

	// Traverse 5 generations
	fatherAncestors, _ := u.repo.GetAncestors(ctx, req.IDSheepMale, 5)
	motherAncestors, _ := u.repo.GetAncestors(ctx, req.IDSheepFemale, 5)

	if fatherAncestors == nil {
		fatherAncestors = make(map[string][]int)
	}
	fatherAncestors[req.IDSheepMale] = append(fatherAncestors[req.IDSheepMale], 0)

	if motherAncestors == nil {
		motherAncestors = make(map[string][]int)
	}
	motherAncestors[req.IDSheepFemale] = append(motherAncestors[req.IDSheepFemale], 0)

	coi := 0.0
	var commonAncestors []domain.CommonAncestor

	for id, fatherGens := range fatherAncestors {
		if motherGens, ok := motherAncestors[id]; ok {
			// Found common ancestor
			for _, fatherGen := range fatherGens {
				for _, motherGen := range motherGens {
					// Formula: (1/2)^(n+m+1)
					coi += math.Pow(0.5, float64(fatherGen+motherGen+1))
				}
			}
			commonAncestors = append(commonAncestors, domain.CommonAncestor{
				IDSheep: id,
				Paths:   []string{"jalur bapak", "jalur ibu"}, // UI labels, can stay indonesian
			})
		}
	}

	res := &domain.InbreedingCheckResponse{
		IDMale:                  req.IDSheepMale,
		IDFemale:                req.IDSheepFemale,
		CoefficientOfInbreeding: coi,
		InbreedingPercentage:    coi * 100,
		InbreedingFlag:          coi > 0,
		CommonAncestors:         commonAncestors,
	}

	if coi >= 0.25 {
		res.RiskCategory = "Sangat Tinggi"
		res.RiskLevel = "high"
		res.Recommendation = "Sangat dilarang (Induk-anak / Saudara kandung). Risiko cacat genetik sangat besar."
	} else if coi >= 0.125 {
		res.RiskCategory = "Tinggi"
		res.RiskLevel = "high"
		res.Recommendation = "Dilarang (Saudara tiri). Risiko inbreeding depression besar."
	} else if coi >= 0.0625 {
		res.RiskCategory = "Ambang Batas"
		res.RiskLevel = "medium"
		res.Recommendation = "Ambang batas (Sepupu pertama). Sebaiknya dihindari jika memungkinkan."
	} else if coi >= 0.03125 {
		res.RiskCategory = "Rendah"
		res.RiskLevel = "low"
		res.Recommendation = "Risiko rendah (Sepupu sekali lepas). Aman untuk dilanjutkan."
	} else {
		res.RiskCategory = "Sangat Rendah"
		res.RiskLevel = "safe"
		res.Recommendation = "Sangat aman. Hubungan kekerabatan jauh atau tidak ada."
	}

	// InbreedingFlag is true if it's Ambang Batas or worse (>= 6.25%)
	res.InbreedingFlag = coi >= 0.0625

	return res, nil
}

func (u *useCase) GetMatingList(ctx context.Context, status string, inbreedingFlag *bool) ([]*domain.Mating, error) {
	list, err := u.repo.FindAll(ctx, status, inbreedingFlag)
	if err == nil {
		for _, m := range list {
			m.CalculateDays()
		}
	}
	return list, err
}

func (u *useCase) RecordMating(ctx context.Context, matingData *domain.Mating) error {
	// 1. If mating is IB and has an external donor, register or find the external donor first
	if matingData.MatingMethod == "ib" && matingData.ExternalDonor != nil && matingData.ExternalDonor.Name != "" {
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

	// 3. Calculate inbreeding coefficient
	checkReq := domain.InbreedingCheckRequest{
		IDSheepMale:   matingData.IDSheepMale,
		IDSheepFemale: matingData.IDSheepFemale,
	}
	inbreedingRes, _ := u.CheckInbreeding(ctx, checkReq)
	matingData.InbreedingFlag = inbreedingRes.InbreedingFlag
	matingData.CoefficientOfInbreeding = inbreedingRes.CoefficientOfInbreeding

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

	var cageID *string
	if femaleSheep.IDCage != "" {
		cageID = &femaleSheep.IDCage
	}

	followUpTask := &tasksDomain.Task{
		Title:       title,
		Description: fmt.Sprintf("Pemeriksaan kebuntingan berkala setelah perkawinan tanggal %s", matingData.MatingDate.Format("2006-01-02")),
		TaskDate:    taskDate,
		Status:      "pending",
		Priority:    "sedang",
		Category:    "perkawinan",
		Rincian:     "Kontrol Kebuntingan",
		IDCage:      cageID,
		IDMating:    &matingData.IDMating,
	}

	_ = u.taskRepo.StoreTask(ctx, followUpTask)

	return nil
}

func (u *useCase) GetMatingDetail(ctx context.Context, id string) (*domain.Mating, error) {
	m, err := u.repo.FindByID(ctx, id)
	if err == nil && m != nil {
		m.CalculateDays()
	}
	return m, err
}

func (u *useCase) UpdateMatingStatus(ctx context.Context, id string, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}
