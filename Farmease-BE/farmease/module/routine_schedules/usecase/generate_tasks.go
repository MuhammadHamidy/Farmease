package usecase

import (
	"context"
	"time"
)

// GenerateTasks parses all active schedules and generates corresponding tasks up to windowDays.
func (u *useCase) GenerateTasks(ctx context.Context, windowDays int) error {
	localLoc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		localLoc = time.Local
	}

	today := time.Now().In(localLoc)
	todayMidnight := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, localLoc)

	schedules, err := u.repo.FindActiveSchedules(ctx)
	if err != nil {
		return err
	}

	for _, routineSchedule := range schedules {
		u.generateForSchedule(ctx, routineSchedule, todayMidnight, windowDays, localLoc)
	}

	return nil
}
