package domain

import (
	"time"
)

// CalculateDays calculates how many days have passed since MatingDate
func (m *Mating) CalculateDays() {
	if m.MatingDate.IsZero() {
		return
	}
	today := time.Now()
	duration := today.Sub(m.MatingDate)
	m.DaysSinceMating = int(duration.Hours() / 24)
}
