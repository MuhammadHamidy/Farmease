package usecase

import (
	"context"
	"math"

	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

type useCase struct {
	repo domain.BreedingRepository
}

func NewUseCase(repo domain.BreedingRepository) domain.UseCase {
	return &useCase{repo: repo}
}

func (u *useCase) CheckInbreeding(ctx context.Context, req domain.InbreedingCheckRequest) (*domain.InbreedingCheckResponse, error) {
	// Traverse 5 generations
	sireAncestors, _ := u.repo.GetAncestors(ctx, req.IDSheepMale, 5)
	damAncestors, _ := u.repo.GetAncestors(ctx, req.IDSheepFemale, 5)

	coi := 0.0
	var commonAncestors []domain.CommonAncestor

	for id, sireGens := range sireAncestors {
		if damGens, ok := damAncestors[id]; ok {
			// Found common ancestor
			for _, sireGen := range sireGens {
				for _, damGen := range damGens {
					// Formula: (1/2)^(n+m+1)
					coi += math.Pow(0.5, float64(sireGen+damGen+1))
				}
			}
			commonAncestors = append(commonAncestors, domain.CommonAncestor{
				IDSheep: id,
				Paths:   []string{"sire path", "dam path"}, // Simplified placeholder
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
	return u.repo.FindAll(ctx, status, inbreedingFlag)
}

func (u *useCase) RecordMating(ctx context.Context, matingData *domain.Mating) error {
	checkReq := domain.InbreedingCheckRequest{
		IDSheepMale:   matingData.IDSheepMale,
		IDSheepFemale: matingData.IDSheepFemale,
	}
	inbreedingRes, _ := u.CheckInbreeding(ctx, checkReq)
	matingData.InbreedingFlag = inbreedingRes.InbreedingFlag
	matingData.CoefficientOfInbreeding = inbreedingRes.CoefficientOfInbreeding
	return u.repo.Store(ctx, matingData)
}

func (u *useCase) GetMatingDetail(ctx context.Context, id int) (*domain.Mating, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *useCase) UpdateMatingStatus(ctx context.Context, id int, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}
