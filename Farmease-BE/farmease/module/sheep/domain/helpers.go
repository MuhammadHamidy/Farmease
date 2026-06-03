package domain

import (
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
}
