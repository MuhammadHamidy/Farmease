package usecase

import (
	"context"
	"math"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

func (u *useCase) CheckInbreeding(ctx context.Context, req domain.InbreedingCheckRequest) (*domain.InbreedingCheckResponse, error) {
	// Resolve sheep codes to UUIDs if codes are passed
	if req.IDSheepFemale != "" {
		if s, err := u.sheepRepo.FindByCode(ctx, req.IDSheepFemale); err == nil && s != nil && s.IDSheep != "" {
			req.IDSheepFemale = s.IDSheep
		}
	}
	if req.IDSheepMale != "" {
		if s, err := u.sheepRepo.FindByCode(ctx, req.IDSheepMale); err == nil && s != nil && s.IDSheep != "" {
			req.IDSheepMale = s.IDSheep
		}
	}

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
			// Fetch ancestor name
			name := "Unknown"
			if ancestorSheep, err := u.sheepRepo.FindByID(ctx, id); err == nil && ancestorSheep != nil {
				if ancestorSheep.SheepName != "" {
					name = ancestorSheep.SheepName
				} else {
					name = ancestorSheep.SheepCode
				}
			}

			commonAncestors = append(commonAncestors, domain.CommonAncestor{
				IDSheep:   id,
				SheepName: name,
				Paths:     []string{"jalur bapak", "jalur ibu"}, // UI labels, can stay indonesian
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
	
	res.InbreedingFlag = coi >= 0.0625

	return res, nil
}
