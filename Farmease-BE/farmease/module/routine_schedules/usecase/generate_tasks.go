package usecase

import (
	"context"
	"time"
)

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

	for _, rs := range schedules {
		u.generateForSchedule(ctx, rs, todayMidnight, windowDays, localLoc)
	}

	return nil
}
