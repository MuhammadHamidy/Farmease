package usecase

import (
	"fmt"
	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
)

func (u *useCase) CalculateMatingReadiness(s *domain.Sheep, activeMatingFemales map[string]bool, pendingMatingSheeps map[string]bool, latestEstrusChecks map[string]string) {
	// Must be healthy
	if s.Status != "Sehat" && s.Status != "aktif" {
		s.IsReadyToMate = false
		if (s.Status == "Hamil" || s.Status == "hamil") && s.Gender == "betina" {
			s.MatingStatus = "Tidak (Sedang Hamil)"
		} else {
			s.MatingStatus = "Tidak (Belum Siap / Sedang Pemulihan)"
		}
		return
	}

	months := int(s.AgeMonths)

	if s.Gender == "jantan" {
		// Sire (Pejantan): Age >= 12 months, Weight >= 30 kg.
		// Fallback: If s.LastWeight <= 0, bypass weight check
		minAge := 12
		weightLimit := 30.0

		if months < minAge {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak (Belum Cukup Umur)"
			return
		}

		if s.LastWeight > 0 && s.LastWeight < weightLimit {
			s.IsReadyToMate = false
			s.MatingStatus = fmt.Sprintf("Tidak (Berat %.1f kg < %.1f kg)", s.LastWeight, weightLimit)
			return
		}

		// Also check latest estrus check for jantan if any check exists!
		estrusResult, checkExists := latestEstrusChecks[s.IDSheep]
		if !checkExists {
			estrusResult, checkExists = latestEstrusChecks[s.SheepCode]
		}
		if checkExists && estrusResult != "birahi" {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak Birahi"
			return
		}

		s.IsReadyToMate = true
		s.MatingStatus = "Siap Kawin"
	} else if s.Gender == "betina" {
		// Dam (Betina): Age >= 8 months, Weight >= 25 kg, and must be birahi (latest check is birahi, no active mating, no pending mating)
		minAge := 8
		weightLimit := 25.0

		if months < minAge {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak (Belum Cukup Umur)"
			return
		}

		if s.LastWeight > 0 && s.LastWeight < weightLimit {
			s.IsReadyToMate = false
			s.MatingStatus = fmt.Sprintf("Tidak (Berat %.1f kg < %.1f kg)", s.LastWeight, weightLimit)
			return
		}

		// Check active mating
		if activeMatingFemales[s.IDSheep] {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak (Sedang Kawin/Proses)"
			return
		}

		// Check pending mating submission
		if pendingMatingSheeps[s.IDSheep] || pendingMatingSheeps[s.SheepCode] {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak (Menunggu Persetujuan Kawin)"
			return
		}

		// Check latest estrus check
		estrusResult, checkExists := latestEstrusChecks[s.IDSheep]
		if !checkExists {
			estrusResult, checkExists = latestEstrusChecks[s.SheepCode]
		}

		if !checkExists {
			s.IsReadyToMate = false
			s.MatingStatus = "Belum Pencatatan Birahi"
			return
		}

		if estrusResult != "birahi" {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak Birahi"
			return
		}

		s.IsReadyToMate = true
		s.MatingStatus = "Birahi (Siap Kawin)"
	} else {
		s.IsReadyToMate = false
		s.MatingStatus = "Tidak Berlaku (Jenis Kelamin Lain)"
	}
}
