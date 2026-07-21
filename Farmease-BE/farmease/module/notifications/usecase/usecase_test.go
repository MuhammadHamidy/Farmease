package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
)

type mockNotificationRepo struct {
	notifications map[string]*domain.Notification
}

func (m *mockNotificationRepo) FindNotificationsByAccount(ctx context.Context, idAccount string) ([]*domain.Notification, error) {
	var list []*domain.Notification
	for _, n := range m.notifications {
		if n.IDAccount == idAccount {
			list = append(list, n)
		}
	}
	return list, nil
}
func (m *mockNotificationRepo) StoreNotification(ctx context.Context, n *domain.Notification) error {
	m.notifications[n.IDNotification] = n
	return nil
}
func (m *mockNotificationRepo) MarkNotificationRead(ctx context.Context, id string) error {
	if n, ok := m.notifications[id]; ok {
		n.IsRead = true
		return nil
	}
	return errors.New("not found")
}
func (m *mockNotificationRepo) GenerateDynamicReminders(ctx context.Context, idAccount string, now time.Time) error {
	return nil
}

func TestReadNotification(t *testing.T) {
	repo := &mockNotificationRepo{
		notifications: map[string]*domain.Notification{
			"n-1": {IDNotification: "n-1", IsRead: false},
		},
	}
	uc := NewUseCase(repo)

	err := uc.ReadNotification(context.Background(), "n-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if repo.notifications["n-1"].IsRead != true {
		t.Errorf("Expected IsRead to be true, got %v", repo.notifications["n-1"].IsRead)
	}

	err = uc.ReadNotification(context.Background(), "n-404")
	if err == nil {
		t.Errorf("Expected error for non-existent notification")
	}
}

func TestGetMyNotifications(t *testing.T) {
	repo := &mockNotificationRepo{
		notifications: map[string]*domain.Notification{
			"n-1": {IDNotification: "n-1", IDAccount: "acc-1"},
			"n-2": {IDNotification: "n-2", IDAccount: "acc-1"},
			"n-3": {IDNotification: "n-3", IDAccount: "acc-2"},
		},
	}
	uc := NewUseCase(repo)

	notifs, err := uc.GetMyNotifications(context.Background(), "acc-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if len(notifs) != 2 {
		t.Errorf("Expected 2 notifications, got %d", len(notifs))
	}
}
