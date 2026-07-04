package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/module/routine_schedules/domain"
	tasksDomain "github.com/farmease/kebun-be/kebun/module/tasks/domain"
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

func (u *useCase) FindAll(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	return u.repo.FindAll(ctx)
}

func (u *useCase) FindByID(ctx context.Context, id string) (*domain.RoutineSchedule, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *useCase) Create(ctx context.Context, rs *domain.RoutineSchedule) error {
	if rs.Priority == "" {
		rs.Priority = "sedang"
	}
	rs.IsActive = true

	existing, err := u.repo.FindDuplicate(ctx, rs)
	if err != nil {
		return err
	}
	if existing != nil {
		return fmt.Errorf("jadwal rutin dengan judul '%s', kategori '%s', frekuensi '%s', dan waktu mulai '%s' sudah ada", rs.Title, rs.Category, rs.Frequency, rs.StartTime)
	}

	err = u.repo.Store(ctx, rs)
	if err != nil {
		return err
	}

	err = u.GenerateTasksForSchedule(ctx, rs.ID, 30)
	if err != nil {
		fmt.Printf("Warning: failed to generate tasks for schedule %s: %v\n", rs.ID, err)
	}

	return nil
}

func (u *useCase) Update(ctx context.Context, rs *domain.RoutineSchedule) error {
	existing, err := u.repo.FindByID(ctx, rs.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return fmt.Errorf("routine schedule not found")
	}

	if rs.Title == "" { rs.Title = existing.Title }
	if rs.Description == "" { rs.Description = existing.Description }
	if rs.Category == "" { rs.Category = existing.Category }
	if rs.Frequency == "" { rs.Frequency = existing.Frequency }
	if len(rs.DaysOfWeek) == 0 { rs.DaysOfWeek = existing.DaysOfWeek }
	if rs.DayOfMonth == nil { rs.DayOfMonth = existing.DayOfMonth }
	if rs.StartDate.IsZero() { rs.StartDate = existing.StartDate }
	if rs.EndDate == nil { rs.EndDate = existing.EndDate }
	if rs.StartTime == "" { rs.StartTime = existing.StartTime }
	if rs.EndTime == "" { rs.EndTime = existing.EndTime }
	if rs.Priority == "" { rs.Priority = existing.Priority }
	if rs.IDCage == nil { rs.IDCage = existing.IDCage }
	if rs.IDAccount == nil { rs.IDAccount = existing.IDAccount }
	if rs.Rincian == "" { rs.Rincian = existing.Rincian }

	return u.repo.Update(ctx, rs)
}

func (u *useCase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

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

func (u *useCase) generateForSchedule(ctx context.Context, rs *domain.RoutineSchedule, todayMidnight time.Time, windowDays int, localLoc *time.Location) {
	for d := 0; d <= windowDays; d++ {
		targetDate := todayMidnight.AddDate(0, 0, d)

		if !shouldGenerateTask(rs, targetDate) {
			continue
		}

		existingTask, err := u.taskRepo.FindByScheduleAndDate(ctx, rs.ID, targetDate)
		if err != nil {
			continue
		}
		if existingTask != nil {
			continue
		}

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
	rsStartMidnight := time.Date(rs.StartDate.Year(), rs.StartDate.Month(), rs.StartDate.Day(), 0, 0, 0, 0, targetDate.Location())

	if rs.Frequency == "sekali" {
		return sameDate(targetDate, rsStartMidnight)
	}

	if targetDate.Before(rsStartMidnight) {
		return false
	}

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

