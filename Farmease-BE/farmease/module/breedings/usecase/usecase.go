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
			for _, n := range sireGens {
				for _, m := range damGens {
					// Formula: (1/2)^(n+m+1)
					coi += math.Pow(0.5, float64(n+m+1))
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

	if coi < 0.0625 {
		res.RiskLevel = "safe"
		res.Recommendation = "Ideal pair — very low inbreeding risk."
	} else if coi <= 0.125 {
		res.RiskLevel = "medium"
		res.Recommendation = "Low risk mating. Monitor offspring health closely."
	} else {
		res.RiskLevel = "high"
		res.Recommendation = "HIGH risk mating. Strongly recommended to find another pair to avoid inbreeding depression."
	}

	return res, nil
}

func (u *useCase) GetMatingList(ctx context.Context, status string, inbreedingFlag *bool) ([]*domain.Mating, error) {
	return u.repo.FindAll(ctx, status, inbreedingFlag)
}

func (u *useCase) RecordMating(ctx context.Context, p *domain.Mating) error {
	checkReq := domain.InbreedingCheckRequest{
		IDSheepMale:   p.IDSheepMale,
		IDSheepFemale: p.IDSheepFemale,
	}
	inbreedingRes, _ := u.CheckInbreeding(ctx, checkReq)
	p.InbreedingFlag = inbreedingRes.InbreedingFlag
	p.CoefficientOfInbreeding = inbreedingRes.CoefficientOfInbreeding
	return u.repo.Store(ctx, p)
}

func (u *useCase) GetMatingDetail(ctx context.Context, id int) (*domain.Mating, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *useCase) UpdateMatingStatus(ctx context.Context, id int, status string, notes string) error {
	return u.repo.UpdateStatus(ctx, id, status, notes)
}
