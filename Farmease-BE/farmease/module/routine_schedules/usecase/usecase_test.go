package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type mockRoutineScheduleRepo struct {
	schedules map[string]*domain.RoutineSchedule
}

func (m *mockRoutineScheduleRepo) FindAll(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	return nil, nil
}
func (m *mockRoutineScheduleRepo) FindByID(ctx context.Context, id string) (*domain.RoutineSchedule, error) {
	if s, ok := m.schedules[id]; ok {
		return s, nil
	}
	return nil, errors.New("not found")
}
func (m *mockRoutineScheduleRepo) FindDuplicate(ctx context.Context, rs *domain.RoutineSchedule) (*domain.RoutineSchedule, error) {
	return nil, nil
}
func (m *mockRoutineScheduleRepo) Store(ctx context.Context, rs *domain.RoutineSchedule) error {
	m.schedules[rs.ID] = rs
	return nil
}
func (m *mockRoutineScheduleRepo) Update(ctx context.Context, rs *domain.RoutineSchedule) error {
	return nil
}
func (m *mockRoutineScheduleRepo) Delete(ctx context.Context, id string) error {
	return nil
}
func (m *mockRoutineScheduleRepo) FindActiveSchedules(ctx context.Context) ([]*domain.RoutineSchedule, error) {
	return nil, nil
}

type mockTaskRepo struct{}

func (m *mockTaskRepo) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*tasksDomain.Task, error) {
	return nil, nil
}
func (m *mockTaskRepo) FindByID(ctx context.Context, id string) (*tasksDomain.Task, error) {
	return nil, nil
}
func (m *mockTaskRepo) StoreTask(ctx context.Context, t *tasksDomain.Task) error { return nil }
func (m *mockTaskRepo) UpdateTask(ctx context.Context, t *tasksDomain.Task) error { return nil }
func (m *mockTaskRepo) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	return nil
}
func (m *mockTaskRepo) DeleteTask(ctx context.Context, id string) error { return nil }
func (m *mockTaskRepo) FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*tasksDomain.Task, error) {
	return nil, nil
}

func TestFindByID(t *testing.T) {
	repo := &mockRoutineScheduleRepo{
		schedules: map[string]*domain.RoutineSchedule{
			"rs-1": {ID: "rs-1", Title: "Pengecekan Harian"},
		},
	}
	uc := NewUseCase(repo, &mockTaskRepo{})

	rs, err := uc.FindByID(context.Background(), "rs-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if rs == nil || rs.Title != "Pengecekan Harian" {
		t.Errorf("Expected Pengecekan Harian, got %v", rs)
	}

	rs, err = uc.FindByID(context.Background(), "rs-404")
	if err == nil {
		t.Errorf("Expected error for non-existent schedule")
	}
}

func TestCreate(t *testing.T) {
	repo := &mockRoutineScheduleRepo{
		schedules: make(map[string]*domain.RoutineSchedule),
	}
	uc := NewUseCase(repo, &mockTaskRepo{})

	rs := &domain.RoutineSchedule{
		ID:    "rs-2",
		Title: "Pemberian Pakan Siang",
	}

	err := uc.Create(context.Background(), rs)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.schedules) != 1 {
		t.Errorf("Expected schedule to be stored, got map len %d", len(repo.schedules))
	}
}
