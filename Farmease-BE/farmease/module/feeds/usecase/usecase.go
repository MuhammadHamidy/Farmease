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

// NewUseCase creates a new instance of domain.UseCase for feed module operations
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

// getNutrient looks up nutrient values for a given feed name and category.
// Returns a fallback profile based on category if the exact feed is not found.
func getNutrient(feedName string, category string) nutrient {
	name := strings.TrimSpace(feedName)
	if nut, ok := feedNutrients[name]; ok {
		return nut
	}
	
	// Try partial matching
	nameLower := strings.ToLower(name)
	for key, nut := range feedNutrients {
		if strings.Contains(nameLower, strings.ToLower(key)) || strings.Contains(strings.ToLower(key), nameLower) {
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

// calculateSingleRecommendation calculates the optimized feed composition (fresh weight in kg) 
// for sheep based on body weight, available feed stock, and nutritional constraints.
//
// Nutritional Parameters:
//   - Dry Matter (Bahan Kering / BK) required is set to 2.5% of body weight.
//   - Crude Protein (Protein Kasar / PK) required is set to 13.0% of the total Dry Matter (BK).
//   - Target Mix Ratio: 95% Forage (Hijauan) and 5% Concentrate (Konsentrat) by Dry Matter.
func calculateSingleRecommendation(weight float64, availableFeeds []*domain.Feed) ([]domain.RecommendationItem, float64) {
	if weight <= 0 {
		weight = 30.0 // Default fallback weight (average sheep weight)
	}

	// 1. Calculate total Dry Matter (BK) needed (2.5% of body weight)
	totalBK := weight * 0.025
	// 2. Calculate target Crude Protein (PK) needed (13% of total Dry Matter)
	targetPK := totalBK * 0.13

	// 3. Compute target Dry Matter allocations (95% Forage / 5% Concentrate)
	bkForageTarget := totalBK * 0.95
	bkConcentrateTarget := totalBK * 0.05

	var forages []*domain.Feed
	var energyCons []*domain.Feed
	var proteinCons []*domain.Feed

	// Classify all feeds currently in stock (available_stock > 0)
	for _, feed := range availableFeeds {
		if feed.AvailableStock <= 0 {
			continue
		}
		
		nameLower := strings.ToLower(feed.FeedName)
		catLower := strings.ToLower(feed.Category)
		
		// Forage detection (includes garden prunings)
		isForage := catLower == "hijauan" || catLower == "greenery" || 
			strings.Contains(nameLower, "daun") || strings.Contains(nameLower, "rumput") || 
			strings.Contains(nameLower, "pangkas") || strings.Contains(nameLower, "silase") || 
			strings.Contains(nameLower, "gulma") || strings.Contains(nameLower, "ketela") || 
			strings.Contains(nameLower, "odot") || strings.Contains(nameLower, "ilalang")

		if isForage {
			forages = append(forages, feed)
		} else {
			// Concentrate
			nut := getNutrient(feed.FeedName, feed.Category)
			if nut.PK < 0.20 {
				energyCons = append(energyCons, feed)
			} else {
				proteinCons = append(proteinCons, feed)
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
	for index, feed := range forages {
		nut := getNutrient(feed.FeedName, feed.Category)
		forageNutrients[index] = nut
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
	for index, feed := range energyCons {
		nut := getNutrient(feed.FeedName, feed.Category)
		energyNutrients[index] = nut
		totalEnergyPK += nut.PK
	}
	avgEnergyPK := totalEnergyPK / float64(len(energyCons))

	// Average protein concentrate nutrients
	var totalProteinPK float64
	proteinNutrients := make([]nutrient, len(proteinCons))
	for index, feed := range proteinCons {
		nut := getNutrient(feed.FeedName, feed.Category)
		proteinNutrients[index] = nut
		totalProteinPK += nut.PK
	}
	avgProteinPK := totalProteinPK / float64(len(proteinCons))

	// Pearson's Square solver for protein source share (ratioOfProteinSource)
	var ratioOfProteinSource float64
	if avgProteinPK > avgEnergyPK {
		ratioOfProteinSource = (targetPKConcentratePercent - avgEnergyPK) / (avgProteinPK - avgEnergyPK)
	} else {
		ratioOfProteinSource = 0.5
	}

	// Clamp ratioOfProteinSource between 0 and 1
	if ratioOfProteinSource > 1.0 {
		ratioOfProteinSource = 1.0
	} else if ratioOfProteinSource < 0.0 {
		ratioOfProteinSource = 0.0
	}

	// Construct final fresh weight recommendations
	var recommendations []domain.RecommendationItem
	var totalFreshWeight float64

	// Forage fresh weights
	bkPerForage := bkForageTarget / float64(len(forages))
	for index, feed := range forages {
		nut := forageNutrients[index]
		freshForage := bkPerForage / nut.BK
		totalFreshWeight += freshForage
		recommendations = append(recommendations, domain.RecommendationItem{
			Kategori:   "hijauan",
			JumlahKg:   freshForage,
			Keterangan: fmt.Sprintf("%s (BK: %.1f%%, PK: %.1f%%)", feed.FeedName, nut.BK*100, nut.PK*100),
		})
	}

	// Concentrate fresh weights
	bkEnergyTarget := bkConcentrateTarget * (1.0 - ratioOfProteinSource)
	bkProteinTarget := bkConcentrateTarget * ratioOfProteinSource

	if bkEnergyTarget > 0 && len(energyCons) > 0 {
		bkPerEnergy := bkEnergyTarget / float64(len(energyCons))
		for index, feed := range energyCons {
			nut := energyNutrients[index]
			freshEnergy := bkPerEnergy / nut.BK
			totalFreshWeight += freshEnergy
			recommendations = append(recommendations, domain.RecommendationItem{
				Kategori:   "konsentrat",
				JumlahKg:   freshEnergy,
				Keterangan: fmt.Sprintf("%s (Sumber Energi, BK: %.1f%%, PK: %.1f%%)", feed.FeedName, nut.BK*100, nut.PK*100),
			})
		}
	}

	if bkProteinTarget > 0 && len(proteinCons) > 0 {
		bkPerProtein := bkProteinTarget / float64(len(proteinCons))
		for index, feed := range proteinCons {
			nut := proteinNutrients[index]
			freshProtein := bkPerProtein / nut.BK
			totalFreshWeight += freshProtein
			recommendations = append(recommendations, domain.RecommendationItem{
				Kategori:   "konsentrat",
				JumlahKg:   freshProtein,
				Keterangan: fmt.Sprintf("%s (Sumber Protein, BK: %.1f%%, PK: %.1f%%)", feed.FeedName, nut.BK*100, nut.PK*100),
			})
		}
	}

	return recommendations, totalFreshWeight
}

// isValidUUID performs a fast string validation for standard UUID v4 format
func isValidUUID(uuidString string) bool {
	if len(uuidString) != 36 {
		return false
	}
	for index := 0; index < 36; index++ {
		char := uuidString[index]
		if index == 8 || index == 13 || index == 18 || index == 23 {
			if char != '-' {
				return false
			}
		} else {
			if !((char >= '0' && char <= '9') || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F')) {
				return false
			}
		}
	}
	return true
}
