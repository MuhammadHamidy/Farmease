package usecase

import (
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) CalculateMatingReadiness(sheep *domain.Sheep, activeMatingFemales map[string]bool, pendingMatingSheeps map[string]bool, latestEstrusChecks map[string]string) {
	// 1. Health Status check: Only 'Sehat' or 'aktif' sheep are eligible for breeding.
	// If ewe is already pregnant, set status to pregnant.
	if sheep.Status != "Sehat" && sheep.Status != "aktif" {
		sheep.IsReadyToMate = false
		if (sheep.Status == "Hamil" || sheep.Status == "hamil") && sheep.Gender == "betina" {
			sheep.MatingStatus = "Tidak (Sedang Hamil)"
		} else {
			sheep.MatingStatus = "Tidak (Belum Siap / Sedang Pemulihan)"
		}
		return
	}

	months := int(sheep.AgeMonths)

	if sheep.Gender == "jantan" {
		// Sire (Pejantan) criteria:
		// - Minimum age: 12 months
		// - Minimum weight: 30 kg (bypassed if weight is not recorded yet)
		minAge := 12
		weightLimit := 30.0

		if months < minAge {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "Tidak (Belum Cukup Umur)"
			return
		}

		if sheep.LastWeight > 0 && sheep.LastWeight < weightLimit {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = fmt.Sprintf("Tidak (Berat %.1f kg < %.1f kg)", sheep.LastWeight, weightLimit)
			return
		}

		// Also check latest estrus check for jantan if any check exists!
		estrusResult, checkExists := latestEstrusChecks[sheep.IDSheep]
		if !checkExists {
			estrusResult, checkExists = latestEstrusChecks[sheep.SheepCode]
		}
		if checkExists && estrusResult != "birahi" {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "Tidak Birahi"
			return
		}

		sheep.IsReadyToMate = true
		sheep.MatingStatus = "Siap Kawin"
	} else if sheep.Gender == "betina" {
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
			sheep.MatingStatus = "Tidak (Belum Cukup Umur)"
			return
		}

		if sheep.LastWeight > 0 && sheep.LastWeight < weightLimit {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = fmt.Sprintf("Tidak (Berat %.1f kg < %.1f kg)", sheep.LastWeight, weightLimit)
			return
		}

		// Check active mating
		if activeMatingFemales[sheep.IDSheep] {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "Tidak (Sedang Kawin/Proses)"
			return
		}

		// Check pending mating submission
		if pendingMatingSheeps[sheep.IDSheep] || pendingMatingSheeps[sheep.SheepCode] {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "Tidak (Menunggu Persetujuan Kawin)"
			return
		}

		// Check latest estrus check
		estrusResult, checkExists := latestEstrusChecks[sheep.IDSheep]
		if !checkExists {
			estrusResult, checkExists = latestEstrusChecks[sheep.SheepCode]
		}

		if !checkExists {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "Belum Pencatatan Birahi"
			return
		}

		if estrusResult != "birahi" {
			sheep.IsReadyToMate = false
			sheep.MatingStatus = "Tidak Birahi"
			return
		}

		sheep.IsReadyToMate = true
		sheep.MatingStatus = "Birahi (Siap Kawin)"
	} else {
		sheep.IsReadyToMate = false
		sheep.MatingStatus = "Tidak Berlaku (Jenis Kelamin Lain)"
	}
}
