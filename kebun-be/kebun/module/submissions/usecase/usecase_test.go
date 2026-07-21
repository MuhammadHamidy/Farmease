package usecase_test

import (
	"context"
	"errors"
	"testing"

	notificationsDomain "github.com/farmease/kebun-be/kebun/module/notifications/domain"
	"github.com/farmease/kebun-be/kebun/module/submissions/domain"
	"github.com/farmease/kebun-be/kebun/module/submissions/usecase"
)

type mockSubmissionRepo struct {
	items    []*domain.Submission
	storeErr error
	findErr  error
}

func (m *mockSubmissionRepo) FindAll(ctx context.Context, status, submissionType string) ([]*domain.Submission, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	var matched []*domain.Submission
	for _, s := range m.items {
		statusMatch := status == "" || s.ApprovalStatus == status
		typeMatch := submissionType == "" || s.Type == submissionType
		if statusMatch && typeMatch {
			matched = append(matched, s)
		}
	}
	return matched, nil
}

func (m *mockSubmissionRepo) FindByID(ctx context.Context, id string) (*domain.Submission, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	for _, s := range m.items {
		if s.ID == id {
			return s, nil
		}
	}
	return nil, nil
}

func (m *mockSubmissionRepo) Store(ctx context.Context, s *domain.Submission) error {
	if m.storeErr != nil {
		return m.storeErr
	}
	s.ID = "test-submission-uuid"
	m.items = append(m.items, s)
	return nil
}

func (m *mockSubmissionRepo) Update(ctx context.Context, s *domain.Submission) error {
	for i, existing := range m.items {
		if existing.ID == s.ID {
			m.items[i] = s
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockSubmissionRepo) Delete(ctx context.Context, id string) error {
	for i, existing := range m.items {
		if existing.ID == id {
			m.items = append(m.items[:i], m.items[i+1:]...)
			return nil
		}
	}
	return nil
}

type mockNotifRepo struct {
	notificationsDomain.NotificationRepository
	notifs []*notificationsDomain.Notification
}

func (m *mockNotifRepo) StoreNotification(ctx context.Context, n *notificationsDomain.Notification) error {
	n.IDNotification = "test-notif-uuid"
	m.notifs = append(m.notifs, n)
	return nil
}

func TestGetAllSubmissions_Success(t *testing.T) {
	repo := &mockSubmissionRepo{
		items: []*domain.Submission{
			{ID: "s1", Type: "pengolahan pupuk", ApprovalStatus: "pending"},
			{ID: "s2", Type: "pemupukan", ApprovalStatus: "approved"},
		},
	}
	notifRepo := &mockNotifRepo{}
	uc := usecase.NewUseCase(repo, notifRepo)

	res, err := uc.GetAllSubmissions(context.Background(), "pending", "pengolahan pupuk")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 submission, got %d", len(res))
	}
}

func TestGetSubmissionByID_Success(t *testing.T) {
	repo := &mockSubmissionRepo{
		items: []*domain.Submission{
			{ID: "s1", Type: "pengolahan pupuk"},
		},
	}
	notifRepo := &mockNotifRepo{}
	uc := usecase.NewUseCase(repo, notifRepo)

	res, err := uc.GetSubmissionByID(context.Background(), "s1")
	if err != nil {
		t.Fatalf("unexpected error finding by id: %v", err)
	}

	if res == nil {
		t.Fatal("expected item, got nil")
	}
}

func TestCreateSubmission_Success(t *testing.T) {
	repo := &mockSubmissionRepo{}
	notifRepo := &mockNotifRepo{}
	uc := usecase.NewUseCase(repo, notifRepo)

	newSub := &domain.Submission{
		Type:         "pemupukan",
		TypeLabel:    "Pemupukan Lahan",
		CageCode:     "L001",
		OperatorName: "Agus",
	}

	err := uc.CreateSubmission(context.Background(), newSub)
	if err != nil {
		t.Fatalf("unexpected error creating: %v", err)
	}

	if len(repo.items) != 1 {
		t.Errorf("expected 1 submission stored, got %d", len(repo.items))
	}

	if len(notifRepo.notifs) != 1 {
		t.Errorf("expected 1 admin notification generated, got %d", len(notifRepo.notifs))
	}
}

func TestUpdateSubmission_Success(t *testing.T) {
	repo := &mockSubmissionRepo{
		items: []*domain.Submission{
			{ID: "s1", Type: "pemupukan", ApprovalStatus: "pending"},
		},
	}
	notifRepo := &mockNotifRepo{}
	uc := usecase.NewUseCase(repo, notifRepo)

	patch := &domain.Submission{
		ApprovalStatus: "approved",
	}

	err := uc.UpdateSubmission(context.Background(), "s1", patch)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.items[0].ApprovalStatus != "approved" {
		t.Errorf("expected status 'approved', got '%s'", repo.items[0].ApprovalStatus)
	}

	if len(notifRepo.notifs) != 1 {
		t.Errorf("expected 1 operator notification generated, got %d", len(notifRepo.notifs))
	}
}

func TestDeleteSubmission_Success(t *testing.T) {
	repo := &mockSubmissionRepo{
		items: []*domain.Submission{
			{ID: "s1"},
		},
	}
	notifRepo := &mockNotifRepo{}
	uc := usecase.NewUseCase(repo, notifRepo)

	err := uc.DeleteSubmission(context.Background(), "s1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(repo.items) != 0 {
		t.Errorf("expected empty items, got %d", len(repo.items))
	}
}
