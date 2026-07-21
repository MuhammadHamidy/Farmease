package usecase_test

import (
	"context"
	"testing"
	"time"

	"github.com/farmease/kebun-be/kebun/module/tasks/domain"
	"github.com/farmease/kebun-be/kebun/module/tasks/usecase"
)

type mockTaskRepo struct {
	tasks      []*domain.Task
	storeErr   error
	updatedVal string
}

func (m *mockTaskRepo) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*domain.Task, error) {
	return m.tasks, nil
}

func (m *mockTaskRepo) FindByID(ctx context.Context, id string) (*domain.Task, error) {
	for _, t := range m.tasks {
		if t.IDTask == id {
			return t, nil
		}
	}
	return nil, nil
}

func (m *mockTaskRepo) StoreTask(ctx context.Context, t *domain.Task) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	t.IDTask = "test-task-uuid"
	m.tasks = append(m.tasks, t)
	return nil
}

func (m *mockTaskRepo) UpdateTask(ctx context.Context, t *domain.Task) error {
	return nil
}

func (m *mockTaskRepo) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	m.updatedVal = status
	for _, t := range m.tasks {
		if t.IDTask == id {
			t.Status = status
			return nil
		}
	}
	return nil
}

func (m *mockTaskRepo) DeleteTask(ctx context.Context, id string) error {
	return nil
}

func (m *mockTaskRepo) FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*domain.Task, error) {
	return nil, nil
}

func TestCreateTask_Success(t *testing.T) {
	repo := &mockTaskRepo{}
	uc := usecase.NewUseCase(repo)

	newTask := &domain.Task{
		Title:       "Penyiraman Rutin Lahan Kelengkeng",
		Description: "Siram secukupnya pagi ini",
		TaskDate:    time.Now(),
		Priority:    "tinggi",
		Category:    "penyiraman",
		Rincian:     "Siram Manual",
	}

	err := uc.CreateTask(context.Background(), newTask)
	if err != nil {
		t.Fatalf("unexpected error creating task: %v", err)
	}

	if len(repo.tasks) != 1 {
		t.Errorf("expected 1 task stored, got %d", len(repo.tasks))
	}
	if repo.tasks[0].Status != "pending" {
		t.Errorf("expected default task status 'pending', got '%s'", repo.tasks[0].Status)
	}
}

func TestCompleteTask_Success(t *testing.T) {
	existingTask := &domain.Task{
		IDTask: "task-123",
		Title:  "Penyiraman Rutin Lahan Kelengkeng",
		Status: "pending",
	}
	repo := &mockTaskRepo{
		tasks: []*domain.Task{existingTask},
	}
	uc := usecase.NewUseCase(repo)

	err := uc.CompleteTask(context.Background(), "task-123")
	if err != nil {
		t.Fatalf("unexpected error completing task: %v", err)
	}

	if repo.updatedVal != "done" {
		t.Errorf("expected status to be updated to 'done', got '%s'", repo.updatedVal)
	}
}
