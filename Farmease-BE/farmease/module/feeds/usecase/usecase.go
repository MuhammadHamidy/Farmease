package usecase

import (
	"fmt"
	"strings"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)




type useCase struct {
	repo      domain.FeedRepository
	sheepRepo sheepDomain.SheepRepository
	taskRepo  tasksDomain.TaskRepository
}

func NewUseCase(repo domain.FeedRepository, sheepRepo sheepDomain.SheepRepository, taskRepo tasksDomain.TaskRepository) domain.UseCase {
	return &useCase{repo: repo, sheepRepo: sheepRepo, taskRepo: taskRepo}
}




// nutrient represents Dry Matter (BK) and Crude Protein (PK) percentages
type nutrient struct {
	BK float64 // Bahan Kering (fraction: 0.0 to 1.0)
	PK float64 // Protein Kasar (fraction: 0.0 to 1.0)
}

// feedNutrients maps specific feed names to their nutrient profiles
var feedNutrients = map[string]nutrient{
	// Hijauan (Forage)
	"Rumput":                       {BK: 0.215, PK: 0.124},
	"Napier Grass / Rumput Gajah":  {BK: 0.215, PK: 0.124},
	"Rumput Gajah":                 {BK: 0.215, PK: 0.124},
	"Ketela Pohon":                 {BK: 0.20,  PK: 0.08},
	"Odot":                         {BK: 0.18,  PK: 0.24},
	"Ilalang":                      {BK: 0.334, PK: 0.063},
	
	// Hijauan Kebun (Integrated from Garden)
	"Daun Alpukat (Mentah)":        {BK: 0.25,  PK: 0.09},
	"Daun Kelengkeng (Mentah)":     {BK: 0.26,  PK: 0.08},
	"Gulma / Rumput Liar (Mentah)": {BK: 0.22,  PK: 0.11},
	"Silase Daun Alpukat":          {BK: 0.35,  PK: 0.095},
	"Silase Daun Kelengkeng":        {BK: 0.36,  PK: 0.085},
	"Pakan Rumput Cacah":           {BK: 0.24,  PK: 0.12},

	// Konsentrat (Concentrates)
	"Bekatul":                      {BK: 0.87,  PK: 0.12},
	"Onggok":                       {BK: 0.87,  PK: 0.05},
	"Jagung":                       {BK: 0.86,  PK: 0.136},
	"Ampas Tahu":                   {BK: 0.108, PK: 0.257},
	"Bungkil kelapa Sawit":         {BK: 0.925, PK: 0.24},
	"Bungkil Kacang Tanah":         {BK: 0.914, PK: 0.563},
	"Consantrate Pellet A":         {BK: 0.88,  PK: 0.16},
}

// getNutrient looks up nutrient values for a given feed name and category
func getNutrient(feedName string, category string) nutrient {
	name := strings.TrimSpace(feedName)
	if nut, ok := feedNutrients[name]; ok {
		return nut
	}
	
	// Try partial matching
	nameLower := strings.ToLower(name)
	for k, nut := range feedNutrients {
		if strings.Contains(nameLower, strings.ToLower(k)) || strings.Contains(strings.ToLower(k), nameLower) {
			return nut
		}
	}

	// Fallback classifications based on name/category
	cat := strings.ToLower(category)
	if cat == "hijauan" || cat == "greenery" || 
		strings.Contains(nameLower, "daun") || strings.Contains(nameLower, "rumput") || 
		strings.Contains(nameLower, "pangkas") || strings.Contains(nameLower, "silase") || 
		strings.Contains(nameLower, "gulma") {
		return nutrient{BK: 0.22, PK: 0.12} // Default average forage
	}
	
	return nutrient{BK: 0.85, PK: 0.12} // Default average concentrate
}

// calculateSingleRecommendation computes feed recommendations based on body weight and available feeds
func calculateSingleRecommendation(weight float64, availableFeeds []*domain.Feed) ([]domain.RecommendationItem, float64) {
	if weight <= 0 {
		weight = 30.0 // Default fallback weight
	}

	// 1. Total Bahan Kering (BK) = 2.5% of body weight
	totalBK := weight * 0.025
	// 2. Kebutuhan Protein Kasar (PK) total = 13% of total BK
	targetPK := totalBK * 0.13

	// 3. Proporsi BK: 95% Hijauan, 5% Konsentrat
	bkForageTarget := totalBK * 0.95
	bkConcentrateTarget := totalBK * 0.05

	var forages []*domain.Feed
	var energyCons []*domain.Feed
	var proteinCons []*domain.Feed

	// Classify all feeds currently in stock (available_stock > 0)
	for _, f := range availableFeeds {
		if f.AvailableStock <= 0 {
			continue
		}
		
		nameLower := strings.ToLower(f.FeedName)
		catLower := strings.ToLower(f.Category)
		
		// Forage detection (includes garden prunings)
		isForage := catLower == "hijauan" || catLower == "greenery" || 
			strings.Contains(nameLower, "daun") || strings.Contains(nameLower, "rumput") || 
			strings.Contains(nameLower, "pangkas") || strings.Contains(nameLower, "silase") || 
			strings.Contains(nameLower, "gulma") || strings.Contains(nameLower, "ketela") || 
			strings.Contains(nameLower, "odot") || strings.Contains(nameLower, "ilalang")

		if isForage {
			forages = append(forages, f)
		} else {
			// Concentrate
			nut := getNutrient(f.FeedName, f.Category)
			if nut.PK < 0.20 {
				energyCons = append(energyCons, f)
			} else {
				proteinCons = append(proteinCons, f)
			}
		}
	}

	// Fallback to defaults if stock is empty
	if len(forages) == 0 {
		forages = append(forages, &domain.Feed{FeedName: "Rumput Gajah", Category: "hijauan"})
	}
	if len(energyCons) == 0 {
		energyCons = append(energyCons, &domain.Feed{FeedName: "Bekatul", Category: "konsentrat"})
	}
	if len(proteinCons) == 0 {
		proteinCons = append(proteinCons, &domain.Feed{FeedName: "Ampas Tahu", Category: "konsentrat"})
	}

	// Average forage nutrients (assuming equal share in mix)
	var totalForagePK float64
	forageNutrients := make([]nutrient, len(forages))
	for i, f := range forages {
		nut := getNutrient(f.FeedName, f.Category)
		forageNutrients[i] = nut
		totalForagePK += nut.PK
	}
	avgForagePK := totalForagePK / float64(len(forages))

	// Forage PK contribution
	pkProvidedByForage := bkForageTarget * avgForagePK

	// Target PK percentage in concentrate
	pkNeededFromConcentrate := targetPK - pkProvidedByForage
	if pkNeededFromConcentrate < 0 {
		pkNeededFromConcentrate = 0
	}
	targetPKConcentratePercent := pkNeededFromConcentrate / bkConcentrateTarget

	// Average energy concentrate nutrients
	var totalEnergyPK float64
	energyNutrients := make([]nutrient, len(energyCons))
	for i, f := range energyCons {
		nut := getNutrient(f.FeedName, f.Category)
		energyNutrients[i] = nut
		totalEnergyPK += nut.PK
	}
	avgEnergyPK := totalEnergyPK / float64(len(energyCons))

	// Average protein concentrate nutrients
	var totalProteinPK float64
	proteinNutrients := make([]nutrient, len(proteinCons))
	for i, f := range proteinCons {
		nut := getNutrient(f.FeedName, f.Category)
		proteinNutrients[i] = nut
		totalProteinPK += nut.PK
	}
	avgProteinPK := totalProteinPK / float64(len(proteinCons))

	// Pearson's Square solver for protein source share (x)
	var x float64
	if avgProteinPK > avgEnergyPK {
		x = (targetPKConcentratePercent - avgEnergyPK) / (avgProteinPK - avgEnergyPK)
	} else {
		x = 0.5
	}

	// Clamp x between 0 and 1
	if x > 1.0 {
		x = 1.0
	} else if x < 0.0 {
		x = 0.0
	}

	// Construct final fresh weight recommendations
	var recommendations []domain.RecommendationItem
	var totalFreshWeight float64

	// Forage fresh weights
	bkPerForage := bkForageTarget / float64(len(forages))
	for i, f := range forages {
		nut := forageNutrients[i]
		freshForage := bkPerForage / nut.BK
		totalFreshWeight += freshForage
		recommendations = append(recommendations, domain.RecommendationItem{
			Kategori:   "hijauan",
			JumlahKg:   freshForage,
			Keterangan: fmt.Sprintf("%s (BK: %.1f%%, PK: %.1f%%)", f.FeedName, nut.BK*100, nut.PK*100),
		})
	}

	// Concentrate fresh weights
	bkEnergyTarget := bkConcentrateTarget * (1.0 - x)
	bkProteinTarget := bkConcentrateTarget * x

	if bkEnergyTarget > 0 && len(energyCons) > 0 {
		bkPerEnergy := bkEnergyTarget / float64(len(energyCons))
		for i, f := range energyCons {
			nut := energyNutrients[i]
			freshEnergy := bkPerEnergy / nut.BK
			totalFreshWeight += freshEnergy
			recommendations = append(recommendations, domain.RecommendationItem{
				Kategori:   "konsentrat",
				JumlahKg:   freshEnergy,
				Keterangan: fmt.Sprintf("%s (Sumber Energi, BK: %.1f%%, PK: %.1f%%)", f.FeedName, nut.BK*100, nut.PK*100),
			})
		}
	}

	if bkProteinTarget > 0 && len(proteinCons) > 0 {
		bkPerProtein := bkProteinTarget / float64(len(proteinCons))
		for i, f := range proteinCons {
			nut := proteinNutrients[i]
			freshProtein := bkPerProtein / nut.BK
			totalFreshWeight += freshProtein
			recommendations = append(recommendations, domain.RecommendationItem{
				Kategori:   "konsentrat",
				JumlahKg:   freshProtein,
				Keterangan: fmt.Sprintf("%s (Sumber Protein, BK: %.1f%%, PK: %.1f%%)", f.FeedName, nut.BK*100, nut.PK*100),
			})
		}
	}

	return recommendations, totalFreshWeight
}

func isValidUUID(u string) bool {
	if len(u) != 36 {
		return false
	}
	for i := 0; i < 36; i++ {
		c := u[i]
		if i == 8 || i == 13 || i == 18 || i == 23 {
			if c != '-' {
				return false
			}
		} else {
			if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
				return false
			}
		}
	}
	return true
}
