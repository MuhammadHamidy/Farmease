package usecase

import (
	"context"
	"time"
)

// GenerateTasksForSchedule generates tasks for a specific routine schedule up to windowDays.
func (u *useCase) GenerateTasksForSchedule(ctx context.Context, scheduleID string, windowDays int) error {
	localLoc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		localLoc = time.Local
	}

	today := time.Now().In(localLoc)
	todayMidnight := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, localLoc)

	routineSchedule, err := u.repo.FindByID(ctx, scheduleID)
	if err != nil || routineSchedule == nil {
		return err
	}

	u.generateForSchedule(ctx, routineSchedule, todayMidnight, windowDays, localLoc)
	return nil
}
