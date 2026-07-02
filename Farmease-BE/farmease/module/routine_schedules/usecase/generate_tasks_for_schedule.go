package usecase

import (
	"context"
	"time"
)

func (u *useCase) GenerateTasksForSchedule(ctx context.Context, scheduleID string, windowDays int) error {
	localLoc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		localLoc = time.Local
	}

	today := time.Now().In(localLoc)
	todayMidnight := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, localLoc)

	rs, err := u.repo.FindByID(ctx, scheduleID)
	if err != nil || rs == nil {
		return err
	}

	u.generateForSchedule(ctx, rs, todayMidnight, windowDays, localLoc)
	return nil
}
