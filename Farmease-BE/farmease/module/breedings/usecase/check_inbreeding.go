package usecase

import (
	"context"
	"math"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

// CheckInbreeding checks the coefficient of inbreeding between a male and a female sheep 
// to calculate genetic risks and prevent inbreeding depression across 5 generations.
func (u *useCase) CheckInbreeding(ctx context.Context, request domain.InbreedingCheckRequest) (*domain.InbreedingCheckResponse, error) {
	// Resolve female sheep code to UUID if code is passed
	if request.IDSheepFemale != "" {
		if femaleSheep, err := u.sheepRepo.FindByCode(ctx, request.IDSheepFemale); err == nil && femaleSheep != nil && femaleSheep.IDSheep != "" {
			request.IDSheepFemale = femaleSheep.IDSheep
		}
	}
	// Resolve male sheep code to UUID if code is passed
	if request.IDSheepMale != "" {
		if maleSheep, err := u.sheepRepo.FindByCode(ctx, request.IDSheepMale); err == nil && maleSheep != nil && maleSheep.IDSheep != "" {
			request.IDSheepMale = maleSheep.IDSheep
		}
	}

	if request.IDSheepMale == "" || request.IDSheepFemale == "" {
		return &domain.InbreedingCheckResponse{
			IDMale:                  request.IDSheepMale,
			IDFemale:                request.IDSheepFemale,
			CoefficientOfInbreeding: 0.0,
			InbreedingPercentage:    0.0,
			InbreedingFlag:          false,
			RiskCategory:            "Sangat Rendah",
			RiskLevel:               "safe",
			Recommendation:          "Sangat aman. Hubungan kekerabatan jauh atau tidak ada.",
		}, nil
	}

	// Traverse 5 generations of ancestors
	fatherAncestors, _ := u.repo.GetAncestors(ctx, request.IDSheepMale, 5)
	motherAncestors, _ := u.repo.GetAncestors(ctx, request.IDSheepFemale, 5)

	if fatherAncestors == nil {
		fatherAncestors = make(map[string][]int)
	}
	fatherAncestors[request.IDSheepMale] = append(fatherAncestors[request.IDSheepMale], 0)

	if motherAncestors == nil {
		motherAncestors = make(map[string][]int)
	}
	motherAncestors[request.IDSheepFemale] = append(motherAncestors[request.IDSheepFemale], 0)

	coefficientValue := 0.0
	var commonAncestors []domain.CommonAncestor

	for ancestorID, fatherGens := range fatherAncestors {
		if motherGens, ok := motherAncestors[ancestorID]; ok {
			// Found common ancestor
			for _, fatherGen := range fatherGens {
				for _, motherGen := range motherGens {
					// Formula: Fx = Sigma [ (1/2) ^ (n + m + 1) ]
					coefficientValue += math.Pow(0.5, float64(fatherGen+motherGen+1))
				}
			}
			// Fetch ancestor details
			ancestorName := "Unknown"
			if ancestorSheep, err := u.sheepRepo.FindByID(ctx, ancestorID); err == nil && ancestorSheep != nil {
				if ancestorSheep.SheepName != "" {
					ancestorName = ancestorSheep.SheepName
				} else {
					ancestorName = ancestorSheep.SheepCode
				}
			}

			commonAncestors = append(commonAncestors, domain.CommonAncestor{
				IDSheep:   ancestorID,
				SheepName: ancestorName,
				Paths:     []string{"jalur bapak", "jalur ibu"},
			})
		}
	}

	response := &domain.InbreedingCheckResponse{
		IDMale:                  request.IDSheepMale,
		IDFemale:                request.IDSheepFemale,
		CoefficientOfInbreeding: coefficientValue,
		InbreedingPercentage:    coefficientValue * 100,
		InbreedingFlag:          coefficientValue > 0,
		CommonAncestors:         commonAncestors,
	}

	if coefficientValue >= 0.25 {
		response.RiskCategory = "Sangat Tinggi"
		response.RiskLevel = "high"
		response.Recommendation = "Sangat dilarang (Induk-anak / Saudara kandung). Risiko cacat genetik sangat besar."
	} else if coefficientValue >= 0.125 {
		response.RiskCategory = "Tinggi"
		response.RiskLevel = "high"
		response.Recommendation = "Dilarang (Saudara tiri). Risiko inbreeding depression besar."
	} else if coefficientValue >= 0.0625 {
		response.RiskCategory = "Ambang Batas"
		response.RiskLevel = "medium"
		response.Recommendation = "Ambang batas (Sepupu pertama). Sebaiknya dihindari jika memungkinkan."
	} else if coefficientValue >= 0.03125 {
		response.RiskCategory = "Rendah"
		response.RiskLevel = "low"
		response.Recommendation = "Risiko rendah (Sepupu sekali lepas). Aman untuk dilanjutkan."
	} else {
		response.RiskCategory = "Sangat Rendah"
		response.RiskLevel = "safe"
		response.Recommendation = "Sangat aman. Hubungan kekerabatan jauh atau tidak ada."
	}
	
	response.InbreedingFlag = coefficientValue >= 0.0625

	return response, nil
}
