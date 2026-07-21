package usecase_test

import (
	"context"
	"testing"
	"time"

	"github.com/farmease/kebun-be/kebun/module/routine_schedules/domain"
	"github.com/farmease/kebun-be/kebun/module/routine_schedules/usecase"
	tasksDomain "github.com/farmease/kebun-be/kebun/module/tasks/domain"
)

type mockScheduleRepo struct {
	schedules []*domain.RoutineSchedule
	storeErr  error
	dupRs     *domain.RoutineSchedule
}

func (m *mockScheduleRepo) FindAll(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	return m.schedules, nil
}

func (m *mockScheduleRepo) FindByID(ctx context.Context, id string) (*domain.RoutineSchedule, error) {
	for _, s := range m.schedules {
		if s.ID == id {
			return s, nil
		}
	}
	return nil, nil
}

func (m *mockScheduleRepo) FindDuplicate(ctx context.Context, rs *domain.RoutineSchedule) (*domain.RoutineSchedule, error) {
	return m.dupRs, nil
}

func (m *mockScheduleRepo) Store(ctx context.Context, rs *domain.RoutineSchedule) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	rs.ID = "test-schedule-uuid"
	m.schedules = append(m.schedules, rs)
	return nil
}

func (m *mockScheduleRepo) Update(ctx context.Context, rs *domain.RoutineSchedule) error {
	return nil
}

func (m *mockScheduleRepo) Delete(ctx context.Context, id string) error {
	return nil
}

func (m *mockScheduleRepo) FindActiveSchedules(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	return m.schedules, nil
}

type mockTaskRepo struct {
	tasks    []*tasksDomain.Task
	storeErr error
}

func (m *mockTaskRepo) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*tasksDomain.Task, error) {
	return m.tasks, nil
}

func (m *mockTaskRepo) FindByID(ctx context.Context, id string) (*tasksDomain.Task, error) {
	return nil, nil
}

func (m *mockTaskRepo) StoreTask(ctx context.Context, t *tasksDomain.Task) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	t.IDTask = "test-task-uuid"
	m.tasks = append(m.tasks, t)
	return nil
}

func (m *mockTaskRepo) UpdateTask(ctx context.Context, t *tasksDomain.Task) error {
	return nil
}

func (m *mockTaskRepo) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	return nil
}

func (m *mockTaskRepo) DeleteTask(ctx context.Context, id string) error {
	return nil
}

func (m *mockTaskRepo) FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*tasksDomain.Task, error) {
	for _, t := range m.tasks {
		if t.ScheduleID != nil && *t.ScheduleID == scheduleID && t.TaskDate.Format("2006-01-02") == taskDate.Format("2006-01-02") {
			return t, nil
		}
	}
	return nil, nil
}

func TestCreateSchedule_Success(t *testing.T) {
	schedRepo := &mockScheduleRepo{}
	taskRepo := &mockTaskRepo{}
	uc := usecase.NewUseCase(schedRepo, taskRepo)

	ctx := context.Background()
	newSched := &domain.RoutineSchedule{
		Title:      "Penyiraman Harian Alpukat",
		Category:   "penyiraman",
		Frequency:  "harian",
		StartTime:  "08:00",
		EndTime:    "09:00",
		DaysOfWeek: []int32{1, 2, 3, 4, 5, 6, 7},
		StartDate:  time.Now(),
		Priority:   "tinggi",
		Rincian:    "Siram Manual",
	}

	err := uc.Create(ctx, newSched)
	if err != nil {
		t.Fatalf("unexpected error creating schedule: %v", err)
	}

	if len(schedRepo.schedules) != 1 {
		t.Errorf("expected 1 schedule stored, got %d", len(schedRepo.schedules))
	}

	if newSched.ID != "test-schedule-uuid" {
		t.Errorf("expected schedule ID 'test-schedule-uuid', got '%s'", newSched.ID)
	}

	if len(taskRepo.tasks) == 0 {
		t.Error("expected tasks to be generated automatically, got 0")
	}
}

func TestCreateSchedule_Duplicate(t *testing.T) {
	existingSched := &domain.RoutineSchedule{
		ID:        "existing-id",
		Title:     "Penyiraman Harian Alpukat",
		Category:  "penyiraman",
		Frequency: "harian",
		StartTime: "08:00",
	}
	schedRepo := &mockScheduleRepo{dupRs: existingSched}
	taskRepo := &mockTaskRepo{}
	uc := usecase.NewUseCase(schedRepo, taskRepo)

	ctx := context.Background()
	newSched := &domain.RoutineSchedule{
		Title:     "Penyiraman Harian Alpukat",
		Category:  "penyiraman",
		Frequency: "harian",
		StartTime: "08:00",
	}

	err := uc.Create(ctx, newSched)
	if err == nil {
		t.Fatal("expected duplicate schedule error, got nil")
	}

	expectedErrSub := "sudah ada"
	if err.Error() == "" || !contains(err.Error(), expectedErrSub) {
		t.Errorf("expected error containing '%s', got '%v'", expectedErrSub, err)
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > len(substr) && containsSub(s, substr))
}

func containsSub(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
