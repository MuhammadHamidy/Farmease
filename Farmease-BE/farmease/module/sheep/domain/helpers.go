package domain

import (
	"fmt"
	"time"
)

// CalculateAge calculates the age in days and months from date of birth
func (s *Sheep) CalculateAge() {
	if s.DateOfBirth == nil {
		s.AgeString = "—"
		return
	}

	today := time.Now()
	duration := today.Sub(*s.DateOfBirth)
	
	// Calculate days
	s.AgeDays = int(duration.Hours() / 24)
	
	// Calculate months (average 30.43 days per month to match FE)
	s.AgeMonths = float64(s.AgeDays) / 30.43

	months := int(s.AgeMonths)
	if s.AgeDays < 30 {
		s.AgeString = fmt.Sprintf("%d hari", s.AgeDays)
	} else if months < 12 {
		s.AgeString = fmt.Sprintf("%d bulan", months)
	} else {
		years := months / 12
		remainingMonths := months % 12
		if remainingMonths == 0 {
			s.AgeString = fmt.Sprintf("%d tahun", years)
		} else {
			s.AgeString = fmt.Sprintf("%d tahun %d bulan", years, remainingMonths)
		}
	}

	// Calculate Mating Status
	if s.Gender == "betina" {
		if (s.Status == "Sehat" || s.Status == "aktif") && months >= 8 {
			s.IsReadyToMate = false
			s.MatingStatus = "Belum Pencatatan Birahi"
		} else if s.Status == "Hamil" || s.Status == "hamil" {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak (Sedang Hamil)"
		} else if months < 8 {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak (Belum Cukup Umur)"
		} else {
			s.IsReadyToMate = false
			s.MatingStatus = "Tidak (Belum Siap / Sedang Pemulihan)"
		}
	} else {
		s.IsReadyToMate = false
		s.MatingStatus = "Tidak Berlaku (Jantan)"
	}
}

// CalculateADG calculates the Average Daily Gain (ADG) and assigns a label
func (s *Sheep) CalculateADG() {
	if s.FirstWeightDate == nil || s.LastWeightDate == nil {
		return
	}

	if s.FirstWeightDate.Equal(*s.LastWeightDate) {
		zeroVal := 0
		s.ADG = &zeroVal
		s.ADGLabel = "Kurang"
		return
	}

	days := s.LastWeightDate.Sub(*s.FirstWeightDate).Hours() / 24
	if days <= 0 {
		days = 1 // Prevent division by zero
	}

	adg := ((s.LastWeight - s.FirstWeight) / days) * 1000 // Convert kg to grams
	adgInt := int(adg + 0.5) // Math.round

	var label string
	if adgInt > 100 {
		label = "Baik"
	} else if adgInt > 50 {
		label = "Cukup"
	} else {
		label = "Kurang"
	}

	s.ADG = &adgInt
	s.ADGLabel = label
}
