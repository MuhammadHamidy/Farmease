package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	submissionsDomain "github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type mockTaskRepo struct {
	tasks map[string]*domain.Task
}

func (m *mockTaskRepo) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*domain.Task, error) {
	return nil, nil
}
func (m *mockTaskRepo) FindByID(ctx context.Context, id string) (*domain.Task, error) {
	if t, ok := m.tasks[id]; ok {
		return t, nil
	}
	return nil, errors.New("not found")
}
func (m *mockTaskRepo) StoreTask(ctx context.Context, t *domain.Task) error {
	m.tasks[t.IDTask] = t
	return nil
}
func (m *mockTaskRepo) UpdateTask(ctx context.Context, t *domain.Task) error {
	m.tasks[t.IDTask] = t
	return nil
}
func (m *mockTaskRepo) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	if t, ok := m.tasks[id]; ok {
		t.Status = status
		return nil
	}
	return errors.New("not found")
}
func (m *mockTaskRepo) DeleteTask(ctx context.Context, id string) error {
	delete(m.tasks, id)
	return nil
}
func (m *mockTaskRepo) FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*domain.Task, error) {
	return nil, nil
}

type mockNotificationRepo struct{}

func (m *mockNotificationRepo) FindNotificationsByAccount(ctx context.Context, idAccount string) ([]*notificationsDomain.Notification, error) {
	return nil, nil
}
func (m *mockNotificationRepo) StoreNotification(ctx context.Context, n *notificationsDomain.Notification) error {
	return nil
}
func (m *mockNotificationRepo) MarkNotificationRead(ctx context.Context, id string) error { return nil }
func (m *mockNotificationRepo) GenerateDynamicReminders(ctx context.Context, idAccount string, now time.Time) error {
	return nil
}

type mockSubmissionRepo struct {
	submissions []*submissionsDomain.Submission
}

func (m *mockSubmissionRepo) FindAll(ctx context.Context, status, submissionType string) ([]*submissionsDomain.Submission, error) {
	return m.submissions, nil
}
func (m *mockSubmissionRepo) FindByID(ctx context.Context, id string) (*submissionsDomain.Submission, error) {
	return nil, nil
}
func (m *mockSubmissionRepo) Store(ctx context.Context, s *submissionsDomain.Submission) error {
	m.submissions = append(m.submissions, s)
	return nil
}
func (m *mockSubmissionRepo) Update(ctx context.Context, s *submissionsDomain.Submission) error {
	return nil
}
func (m *mockSubmissionRepo) Delete(ctx context.Context, id string) error {
	return nil
}

func TestCompleteTask(t *testing.T) {
	repo := &mockTaskRepo{
		tasks: map[string]*domain.Task{
			"task-1": {IDTask: "task-1", Status: "pending", Title: "Siram Alpukat"},
		},
	}
	subRepo := &mockSubmissionRepo{
		submissions: []*submissionsDomain.Submission{},
	}
	uc := NewUseCase(repo, &mockNotificationRepo{}, subRepo)

	_, _, err := uc.CompleteTask(context.Background(), "task-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if repo.tasks["task-1"].Status != "menunggu" {
		t.Errorf("Expected status 'menunggu', got %v", repo.tasks["task-1"].Status)
	}

	_, _, err = uc.CompleteTask(context.Background(), "task-404")
	if err == nil {
		t.Errorf("Expected error for non-existent task")
	}
}

func TestCreateTask(t *testing.T) {
	repo := &mockTaskRepo{
		tasks: make(map[string]*domain.Task),
	}
	subRepo := &mockSubmissionRepo{
		submissions: []*submissionsDomain.Submission{},
	}
	uc := NewUseCase(repo, &mockNotificationRepo{}, subRepo)

	task := &domain.Task{
		IDTask: "task-2",
		Title:  "Bersihkan Kandang",
	}

	err := uc.CreateTask(context.Background(), task)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.tasks) != 1 {
		t.Errorf("Expected task to be stored, got map len %d", len(repo.tasks))
	}
}
