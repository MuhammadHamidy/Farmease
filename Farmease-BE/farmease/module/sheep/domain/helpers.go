package domain

import (
	"fmt"
	"time"
)

// CalculateAge calculates the age in days and months from date of birth
func (s *Sheep) CalculateAge() {
	if s.DateOfBirth == nil {
		return
	}

	today := time.Now()
	duration := today.Sub(*s.DateOfBirth)
	
	// Calculate days
	s.AgeDays = int(duration.Hours() / 24)
	
	// Calculate months (average 30.44 days per month)
	s.AgeMonths = float64(s.AgeDays) / 30.44

	months := int(s.AgeMonths)
	if months >= 12 {
		s.AgeString = fmt.Sprintf("%d thn", months/12)
	} else {
		s.AgeString = fmt.Sprintf("%d bln", months)
	}
}

// CalculateADG calculates the Average Daily Gain (ADG) and assigns a label
func (s *Sheep) CalculateADG() {
	if s.FirstWeightDate == nil || s.LastWeightDate == nil || s.FirstWeightDate.Equal(*s.LastWeightDate) {
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
