package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)




type useCase struct {
	repo     domain.RoutineScheduleRepository
	taskRepo tasksDomain.TaskRepository
}

func NewUseCase(repo domain.RoutineScheduleRepository, taskRepo tasksDomain.TaskRepository) domain.RoutineScheduleUsecase {
	return &useCase{
		repo:     repo,
		taskRepo: taskRepo,
	}
}








func (u *useCase) generateForSchedule(ctx context.Context, rs *domain.RoutineSchedule, todayMidnight time.Time, windowDays int, localLoc *time.Location) {
	for d := 0; d <= windowDays; d++ {
		targetDate := todayMidnight.AddDate(0, 0, d)

		if !shouldGenerateTask(rs, targetDate) {
			continue
		}

		// Check if task already exists for this schedule and target date
		existingTask, err := u.taskRepo.FindByScheduleAndDate(ctx, rs.ID, targetDate)
		if err != nil {
			continue
		}
		if existingTask != nil {
			// Task already generated, skip
			continue
		}

		// Combine date and start time
		taskTime := targetDate
		if rs.StartTime != "" {
			parts := strings.Split(rs.StartTime, ":")
			if len(parts) >= 2 {
				var hour, min, sec int
				fmt.Sscanf(parts[0], "%d", &hour)
				fmt.Sscanf(parts[1], "%d", &min)
				if len(parts) >= 3 {
					fmt.Sscanf(parts[2], "%d", &sec)
				}
				taskTime = time.Date(targetDate.Year(), targetDate.Month(), targetDate.Day(), hour, min, sec, 0, localLoc)
			}
		}

		assigneeID := ""
		if rs.IDAccount != nil {
			assigneeID = *rs.IDAccount
		}

		newTask := &tasksDomain.Task{
			Title:       rs.Title,
			Description: rs.Description,
			TaskDate:    taskTime,
			EndTime:     rs.EndTime,
			Status:      "pending",
			Priority:    rs.Priority,
			IDAccount:   assigneeID,
			Category:    rs.Category,
			ScheduleID:  &rs.ID,
			IDCage:      rs.IDCage,
			StartTime:   rs.StartTime,
			Rincian:     rs.Rincian,
		}

		err = u.taskRepo.StoreTask(ctx, newTask)
		if err != nil {
			fmt.Printf("Error storing generated task: %v\n", err)
		}
	}
}

func shouldGenerateTask(rs *domain.RoutineSchedule, targetDate time.Time) bool {
	// Normalize StartDate to midnight for date-only comparison
	rsStartMidnight := time.Date(rs.StartDate.Year(), rs.StartDate.Month(), rs.StartDate.Day(), 0, 0, 0, 0, targetDate.Location())

	if rs.Frequency == "sekali" {
		return sameDate(targetDate, rsStartMidnight)
	}

	// Must be on or after start_date
	if targetDate.Before(rsStartMidnight) {
		return false
	}

	// Must be before or on end_date (if end_date is set)
	if rs.EndDate != nil {
		rsEndMidnight := time.Date(rs.EndDate.Year(), rs.EndDate.Month(), rs.EndDate.Day(), 0, 0, 0, 0, targetDate.Location())
		if targetDate.After(rsEndMidnight) {
			return false
		}
	}

	switch rs.Frequency {
	case "harian":
		return true
	case "mingguan":
		weekday := int32(targetDate.Weekday())
		for _, w := range rs.DaysOfWeek {
			if w == weekday {
				return true
			}
		}
		return false
	case "bulanan":
		if rs.DayOfMonth != nil {
			return int32(targetDate.Day()) == *rs.DayOfMonth
		}
		return false
	}

	return false
}

func sameDate(t1, t2 time.Time) bool {
	return t1.Year() == t2.Year() && t1.Month() == t2.Month() && t1.Day() == t2.Day()
}
