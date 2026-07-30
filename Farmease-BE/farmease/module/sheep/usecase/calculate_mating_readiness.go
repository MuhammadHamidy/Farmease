package usecase

import (
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) CalculateMatingReadiness(sheep *domain.Sheep, activeMatingFemales map[string]bool, pendingMatingSheeps map[string]bool, latestEstrusChecks map[string]string) {
	// 1. Health Status check: Only 'Sehat' or 'aktif' sheep are eligible for breeding.
	// If ewe is already pregnant, set status to pregnant.
	if sheep.Status != "Sehat" && sheep.Status != "aktif" && sheep.Status != "active" {
		sheep.IsReadyToMate = false
		if (sheep.Status == "Hamil" || sheep.Status == "hamil" || sheep.Status == "pregnant") && (sheep.Gender == "betina" || sheep.Gender == "female") {
			sheep.MatingStatus = "PREGNANT"
		} else if sheep.Status == "Sakit" || sheep.Status == "sakit" || sheep.Status == "sick" {
			sheep.MatingStatus = "SICK"
		} else {
			sheep.MatingStatus = "NOT_READY"
		}
		return
	}

	months := int(sheep.AgeMonths)

	if sheep.Gender == "jantan" || sheep.Gender == "male" {
		// Sire (Pejantan) criteria:
		// - Minimum age: 8 months
		// - Minimum weight: 30 kg (bypassed if weight is not recorded yet)
		minAge := 8
		weightLimit := 30.0

		if months < minAge {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "UNDERAGE"
			return
		}

		if sheep.LastWeight > 0 && sheep.LastWeight < weightLimit {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = fmt.Sprintf("WEIGHT_LOW:%.1f", sheep.LastWeight)
			return
		}

		// Also check latest estrus check for jantan if any check exists!
		estrusResult, checkExists := latestEstrusChecks[sheep.IDSheep]
		if !checkExists {
			estrusResult, checkExists = latestEstrusChecks[sheep.SheepCode]
		}
		if checkExists && estrusResult != "birahi" && estrusResult != "in_heat" {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "NOT_IN_HEAT"
			return
		}

		sheep.IsReadyToMate = true
		sheep.MatingStatus = "MATING_READY"
	} else if sheep.Gender == "betina" || sheep.Gender == "female" {
		// Dam (Betina) criteria:
		// - Minimum age: 8 months
		// - Minimum weight: 25 kg (bypassed if weight is not recorded yet)
		// - Must have no active/in-progress mating session
		// - Must have no pending mating submissions awaiting admin approval
		// - Must be marked as 'birahi' (estrus) in the latest check
		minAge := 8
		weightLimit := 25.0

		if months < minAge {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "UNDERAGE"
			return
		}

		if sheep.LastWeight > 0 && sheep.LastWeight < weightLimit {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = fmt.Sprintf("WEIGHT_LOW:%.1f", sheep.LastWeight)
			return
		}

		// Check active mating
		if activeMatingFemales[sheep.IDSheep] {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "IN_MATING_PROCESS"
			return
		}

		// Check pending mating submission
		if pendingMatingSheeps[sheep.IDSheep] || pendingMatingSheeps[sheep.SheepCode] {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "PENDING_APPROVAL"
			return
		}

		// Check latest estrus check
		estrusResult, checkExists := latestEstrusChecks[sheep.IDSheep]
		if !checkExists {
			estrusResult, checkExists = latestEstrusChecks[sheep.SheepCode]
		}

		if !checkExists {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "NOT_CHECKED"
			return
		}

		if estrusResult != "birahi" && estrusResult != "in_heat" {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "NOT_IN_HEAT"
			return
		}

		sheep.IsReadyToMate = true
		sheep.MatingStatus = "MATING_READY"
	} else {
		sheep.IsReadyToMate = false
		sheep.MatingStatus = "NOT_APPLICABLE"
	}
}
