package usecase

import (
	"context"
	"math"

	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
)

type parentInfo struct {
	FatherID string
	MotherID string
	Name     string
}

func (u *useCase) buildPedigreeMap(ctx context.Context, startIDs []string, maxGen int) map[string]parentInfo {
	pedigree := make(map[string]parentInfo)
	visited := make(map[string]bool)

	type item struct {
		id  string
		gen int
	}
	var queue []item

	for _, id := range startIDs {
		if id != "" {
			queue = append(queue, item{id: id, gen: 0})
		}
	}

	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]

		if visited[curr.id] || curr.gen > maxGen {
			continue
		}
		visited[curr.id] = true

		sheep, err := u.sheepRepo.FindByID(ctx, curr.id)
		if err != nil || sheep == nil {
			continue
		}

		info := parentInfo{}
		if sheep.SheepName != "" {
			info.Name = sheep.SheepName
		} else {
			info.Name = sheep.SheepCode
		}

		if sheep.IDFather != nil && *sheep.IDFather != "" {
			info.FatherID = *sheep.IDFather
			if !visited[info.FatherID] && curr.gen+1 <= maxGen {
				queue = append(queue, item{id: info.FatherID, gen: curr.gen + 1})
			}
		}

		if sheep.IDMother != nil && *sheep.IDMother != "" {
			info.MotherID = *sheep.IDMother
			if !visited[info.MotherID] && curr.gen+1 <= maxGen {
				queue = append(queue, item{id: info.MotherID, gen: curr.gen + 1})
			}
		}

		pedigree[curr.id] = info
	}

	return pedigree
}

func calculateWrightCoI(sireID, damID string, pedigree map[string]parentInfo, maxGen int, memo map[string]float64) (float64, []string) {
	if sireID == "" || damID == "" {
		return 0.0, nil
	}
	key := sireID + ":" + damID
	if val, ok := memo[key]; ok {
		return val, nil
	}

	var getFAnimal func(animalID string) float64
	getFAnimal = func(animalID string) float64 {
		if animalID == "" {
			return 0.0
		}
		if val, ok := memo[animalID]; ok {
			return val
		}
		info, ok := pedigree[animalID]
		if !ok || info.FatherID == "" || info.MotherID == "" {
			memo[animalID] = 0.0
			return 0.0
		}
		val, _ := calculateWrightCoI(info.FatherID, info.MotherID, pedigree, maxGen, memo)
		memo[animalID] = val
		return val
	}

	var getAscentPaths func(startID string, currentPath []string, gen int) [][]string
	getAscentPaths = func(startID string, currentPath []string, gen int) [][]string {
		pathCopy := make([]string, len(currentPath))
		copy(pathCopy, currentPath)
		paths := [][]string{pathCopy}

		if gen >= maxGen {
			return paths
		}

		info, ok := pedigree[startID]
		if !ok {
			return paths
		}

		if info.FatherID != "" {
			inPath := false
			for _, node := range currentPath {
				if node == info.FatherID {
					inPath = true
					break
				}
			}
			if !inPath {
				fatherPaths := getAscentPaths(info.FatherID, append(currentPath, info.FatherID), gen+1)
				paths = append(paths, fatherPaths...)
			}
		}

		if info.MotherID != "" {
			inPath := false
			for _, node := range currentPath {
				if node == info.MotherID {
					inPath = true
					break
				}
			}
			if !inPath {
				motherPaths := getAscentPaths(info.MotherID, append(currentPath, info.MotherID), gen+1)
				paths = append(paths, motherPaths...)
			}
		}

		return paths
	}

	pathsS := getAscentPaths(sireID, []string{sireID}, 0)
	pathsD := getAscentPaths(damID, []string{damID}, 0)

	coi := 0.0
	ancestorSet := make(map[string]bool)

	for _, ps := range pathsS {
		for _, pd := range pathsD {
			ancestorS := ps[len(ps)-1]
			ancestorD := pd[len(pd)-1]
			if ancestorS == ancestorD {
				commonAncestor := ancestorS
				prefixS := make(map[string]bool)
				for i := 0; i < len(ps)-1; i++ {
					prefixS[ps[i]] = true
				}
				intersect := false
				for i := 0; i < len(pd)-1; i++ {
					if prefixS[pd[i]] {
						intersect = true
						break
					}
				}

				if !intersect {
					n := len(ps) - 1
					nPrime := len(pd) - 1
					fA := getFAnimal(commonAncestor)
					contrib := math.Pow(0.5, float64(n+nPrime+1)) * (1.0 + fA)
					coi += contrib
					ancestorSet[commonAncestor] = true
				}
			}
		}
	}

	var commonAncestors []string
	for ancestorID := range ancestorSet {
		commonAncestors = append(commonAncestors, ancestorID)
	}

	memo[key] = coi
	return coi, commonAncestors
}

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

	pedigree := u.buildPedigreeMap(ctx, []string{request.IDSheepMale, request.IDSheepFemale}, 5)
	memo := make(map[string]float64)

	coefficientValue, commonAncestorIDs := calculateWrightCoI(request.IDSheepMale, request.IDSheepFemale, pedigree, 5, memo)

	var commonAncestors []domain.CommonAncestor
	for _, ancestorID := range commonAncestorIDs {
		ancestorName := "Unknown"
		if info, ok := pedigree[ancestorID]; ok && info.Name != "" {
			ancestorName = info.Name
		} else if ancestorSheep, err := u.sheepRepo.FindByID(ctx, ancestorID); err == nil && ancestorSheep != nil {
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

	response := &domain.InbreedingCheckResponse{
		IDMale:                  request.IDSheepMale,
		IDFemale:                request.IDSheepFemale,
		CoefficientOfInbreeding: coefficientValue,
		InbreedingPercentage:    coefficientValue * 100,
		CommonAncestors:         commonAncestors,
	}

	if coefficientValue >= 0.25 {
		response.RiskCategory = "VERY_HIGH"
		response.RiskLevel = "high"
		response.Recommendation = "Sangat dilarang (Induk-anak / Saudara kandung). Risiko cacat genetik sangat besar."
	} else if coefficientValue >= 0.125 {
		response.RiskCategory = "HIGH"
		response.RiskLevel = "high"
		response.Recommendation = "Dilarang (Saudara tiri). Risiko inbreeding depression besar."
	} else if coefficientValue >= 0.0625 {
		response.RiskCategory = "MEDIUM"
		response.RiskLevel = "medium"
		response.Recommendation = "Ambang batas (Sepupu pertama). Sebaiknya dihindari jika memungkinkan."
	} else if coefficientValue >= 0.03125 {
		response.RiskCategory = "LOW"
		response.RiskLevel = "low"
		response.Recommendation = "Risiko rendah (Sepupu sekali lepas). Aman untuk dilanjutkan."
	} else {
		response.RiskCategory = "VERY_LOW"
		response.RiskLevel = "safe"
		response.Recommendation = "Sangat aman. Hubungan kekerabatan jauh atau tidak ada."
	}
	
	response.InbreedingFlag = coefficientValue >= 0.0625

	return response, nil
}
