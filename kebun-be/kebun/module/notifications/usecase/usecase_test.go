package usecase_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/farmease/kebun-be/kebun/module/notifications/domain"
	"github.com/farmease/kebun-be/kebun/module/notifications/usecase"
)

type mockNotificationRepo struct {
	items               []*domain.Notification
	findErr             error
	markErr             error
	generateErr         error
	generateCalledWith  string
}

func (m *mockNotificationRepo) FindNotificationsByAccount(ctx context.Context, idAccount string) ([]*domain.Notification, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	var matched []*domain.Notification
	for _, n := range m.items {
		if n.IDAccount == idAccount {
			matched = append(matched, n)
		}
	}
	return matched, nil
}

func (m *mockNotificationRepo) StoreNotification(ctx context.Context, n *domain.Notification) error {
	lID := "test-notif-uuid"
	n.IDNotification = lID
	m.items = append(m.items, n)
	return nil
}

func (m *mockNotificationRepo) MarkNotificationRead(ctx context.Context, id string) error {
	if m.markErr != nil {
		return m.markErr
	}
	for _, n := range m.items {
		if n.IDNotification == id {
			n.IsRead = true
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockNotificationRepo) GenerateDynamicReminders(ctx context.Context, idAccount string, now time.Time) error {
	m.generateCalledWith = idAccount
	if m.generateErr != nil {
		return m.generateErr
	}
	return nil
}

func TestGetMyNotifications_Success(t *testing.T) {
	repo := &mockNotificationRepo{
		items: []*domain.Notification{
			{IDNotification: "n1", IDAccount: "acc-1", Title: "Notif 1", IsRead: false},
			{IDNotification: "n2", IDAccount: "acc-2", Title: "Notif 2", IsRead: false},
		},
	}
	uc := usecase.NewUseCase(repo)

	res, err := uc.GetMyNotifications(context.Background(), "acc-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 1 {
		t.Errorf("expected 1 notification for acc-1, got %d", len(res))
	}

	if repo.generateCalledWith != "acc-1" {
		t.Errorf("expected generate to be called with 'acc-1', got '%s'", repo.generateCalledWith)
	}
}

func TestGetMyNotifications_Error(t *testing.T) {
	expectedErr := errors.New("find error")
	repo := &mockNotificationRepo{findErr: expectedErr}
	uc := usecase.NewUseCase(repo)

	_, err := uc.GetMyNotifications(context.Background(), "acc-1")
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestReadNotification_Success(t *testing.T) {
	repo := &mockNotificationRepo{
		items: []*domain.Notification{
			{IDNotification: "n1", IDAccount: "acc-1", Title: "Notif 1", IsRead: false},
		},
	}
	uc := usecase.NewUseCase(repo)

	err := uc.ReadNotification(context.Background(), "n1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !repo.items[0].IsRead {
		t.Error("expected notification to be marked as read")
	}
}
