package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	notificationsDomain "github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
)

type mockSubmissionRepo struct {
	submissions map[string]*domain.Submission
}

func (m *mockSubmissionRepo) FindAll(ctx context.Context, status, submissionType string) ([]*domain.Submission, error) {
	return nil, nil
}
func (m *mockSubmissionRepo) FindByID(ctx context.Context, id string) (*domain.Submission, error) {
	if s, ok := m.submissions[id]; ok {
		return s, nil
	}
	return nil, errors.New("not found")
}
func (m *mockSubmissionRepo) Store(ctx context.Context, s *domain.Submission) error {
	m.submissions[s.ID] = s
	return nil
}
func (m *mockSubmissionRepo) Update(ctx context.Context, s *domain.Submission) error {
	m.submissions[s.ID] = s
	return nil
}
func (m *mockSubmissionRepo) Delete(ctx context.Context, id string) error {
	return nil
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

func TestGetSubmissionByID(t *testing.T) {
	repo := &mockSubmissionRepo{
		submissions: map[string]*domain.Submission{
			"sub-1": {ID: "sub-1", Type: "Culling"},
		},
	}
	uc := NewUseCase(repo, &mockNotificationRepo{}, nil)

	sub, err := uc.GetSubmissionByID(context.Background(), "sub-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if sub == nil || sub.Type != "Culling" {
		t.Errorf("Expected Culling, got %v", sub)
	}

	sub, err = uc.GetSubmissionByID(context.Background(), "sub-404")
	if err == nil {
		t.Errorf("Expected error for non-existent submission")
	}
}

func TestCreateSubmission(t *testing.T) {
	repo := &mockSubmissionRepo{
		submissions: make(map[string]*domain.Submission),
	}
	uc := NewUseCase(repo, &mockNotificationRepo{}, nil)

	sub := &domain.Submission{
		ID:   "sub-2",
		Type: "Mutasi",
	}

	err := uc.CreateSubmission(context.Background(), sub)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(repo.submissions) != 1 {
		t.Errorf("Expected submission to be stored, got map len %d", len(repo.submissions))
	}
}
