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

func (u *useCase) generateForSchedule(ctx context.Context, routineSchedule *domain.RoutineSchedule, todayMidnight time.Time, windowDays int, localLoc *time.Location) {
	for dayOffset := 0; dayOffset <= windowDays; dayOffset++ {
		targetDate := todayMidnight.AddDate(0, 0, dayOffset)

		if !shouldGenerateTask(routineSchedule, targetDate) {
			continue
		}

		// Check if task already exists for this schedule and target date
		existingTask, err := u.taskRepo.FindByScheduleAndDate(ctx, routineSchedule.ID, targetDate)
		if err != nil {
			continue
		}
		if existingTask != nil {
			// Task already generated, skip
			continue
		}

		// Combine date and start time
		taskTime := targetDate
		if routineSchedule.StartTime != "" {
			parts := strings.Split(routineSchedule.StartTime, ":")
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
		if routineSchedule.IDAccount != nil {
			assigneeID = *routineSchedule.IDAccount
		}

		newTask := &tasksDomain.Task{
			Title:       routineSchedule.Title,
			Description: routineSchedule.Description,
			TaskDate:    taskTime,
			EndTime:     routineSchedule.EndTime,
			Status:      "pending",
			Priority:    routineSchedule.Priority,
			IDAccount:   assigneeID,
			Category:    routineSchedule.Category,
			ScheduleID:  &routineSchedule.ID,
			IDCage:      routineSchedule.IDCage,
			StartTime:   routineSchedule.StartTime,
			Rincian:     routineSchedule.Rincian,
		}

		err = u.taskRepo.StoreTask(ctx, newTask)
		if err != nil {
			fmt.Printf("Error storing generated task: %v\n", err)
		}
	}
}

func shouldGenerateTask(routineSchedule *domain.RoutineSchedule, targetDate time.Time) bool {
	// Normalize StartDate to midnight for date-only comparison
	rsStartMidnight := time.Date(routineSchedule.StartDate.Year(), routineSchedule.StartDate.Month(), routineSchedule.StartDate.Day(), 0, 0, 0, 0, targetDate.Location())

	if routineSchedule.Frequency == "sekali" {
		return sameDate(targetDate, rsStartMidnight)
	}

	// Must be on or after start_date
	if targetDate.Before(rsStartMidnight) {
		return false
	}

	// Must be before or on end_date (if end_date is set)
	if routineSchedule.EndDate != nil {
		rsEndMidnight := time.Date(routineSchedule.EndDate.Year(), routineSchedule.EndDate.Month(), routineSchedule.EndDate.Day(), 0, 0, 0, 0, targetDate.Location())
		if targetDate.After(rsEndMidnight) {
			return false
		}
	}

	switch routineSchedule.Frequency {
	case "harian":
		return true
	case "mingguan":
		weekday := int32(targetDate.Weekday())
		for _, day := range routineSchedule.DaysOfWeek {
			if day == weekday {
				return true
			}
		}
		return false
	case "bulanan":
		if routineSchedule.DayOfMonth != nil {
			return int32(targetDate.Day()) == *routineSchedule.DayOfMonth
		}
		return false
	}

	return false
}

func sameDate(t1, t2 time.Time) bool {
	return t1.Year() == t2.Year() && t1.Month() == t2.Month() && t1.Day() == t2.Day()
}
