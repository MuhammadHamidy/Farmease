package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
)

type mockFeedRepo struct {
	feeds        map[string]*domain.Feed
	feedings     []*domain.Feeding
	stockUpdates map[string]float64
}

func (m *mockFeedRepo) FindAllMaster(ctx context.Context) ([]*domain.Feed, error) {
	return nil, nil
}
func (m *mockFeedRepo) FindMasterByID(ctx context.Context, id string) (*domain.Feed, error) {
	if f, ok := m.feeds[id]; ok {
		return f, nil
	}
	return nil, errors.New("not found")
}
func (m *mockFeedRepo) StoreMaster(ctx context.Context, p *domain.Feed) error {
	m.feeds[p.IDFeed] = p
	return nil
}
func (m *mockFeedRepo) UpdateStock(ctx context.Context, id string, amount float64, actionType string) error {
	if actionType == "kurang" {
		m.stockUpdates[id] -= amount
	} else if actionType == "tambah" {
		m.stockUpdates[id] += amount
	}
	return nil
}
func (m *mockFeedRepo) StoreFeeding(ctx context.Context, f *domain.Feeding) error {
	if f.IDFeeding == "" {
		f.IDFeeding = "feeding-1"
	}
	m.feedings = append(m.feedings, f)
	return nil
}
func (m *mockFeedRepo) FindFeedingHistory(ctx context.Context, idSheep string) ([]*domain.Feeding, error) {
	return nil, nil
}
func (m *mockFeedRepo) FindAllFeedings(ctx context.Context, filter domain.FeedingFilter) ([]*domain.Feeding, int, error) {
	return nil, 0, nil
}
func (m *mockFeedRepo) StoreFeedingMixture(ctx context.Context, fm *domain.FeedingMixture) error {
	return nil
}
func (m *mockFeedRepo) StoreSilageConversion(ctx context.Context, sc *domain.SilageConversion) error {
	return nil
}
func (m *mockFeedRepo) FindAllSilageConversions(ctx context.Context) ([]*domain.SilageConversion, error) {
	return nil, nil
}

type mockSheepRepo struct {
	sheeps map[string]*sheepDomain.Sheep
}
func (m *mockSheepRepo) FindAll(ctx context.Context, filter sheepDomain.SheepFilter) ([]*sheepDomain.Sheep, int, error) { return nil, 0, nil }
func (m *mockSheepRepo) FindByID(ctx context.Context, id string) (*sheepDomain.Sheep, error) {
	if s, ok := m.sheeps[id]; ok {
		return s, nil
	}
	return nil, nil
}
func (m *mockSheepRepo) FindByCode(ctx context.Context, code string) (*sheepDomain.Sheep, error) { return nil, nil }
func (m *mockSheepRepo) FindExternalDonor(ctx context.Context, name, origin string) (*sheepDomain.Sheep, error) { return nil, nil }
func (m *mockSheepRepo) Store(ctx context.Context, s *sheepDomain.Sheep) error { return nil }
func (m *mockSheepRepo) Update(ctx context.Context, s *sheepDomain.Sheep) error { return nil }
func (m *mockSheepRepo) UpdateStatus(ctx context.Context, id string, status string, notes string) error { return nil }
func (m *mockSheepRepo) GetGenealogy(ctx context.Context, id string, maxGeneration int) (*sheepDomain.Genealogy, error) { return nil, nil }
func (m *mockSheepRepo) FindAllTypes(ctx context.Context) ([]*sheepDomain.SheepType, error) { return nil, nil }
func (m *mockSheepRepo) StoreType(ctx context.Context, t *sheepDomain.SheepType) error { return nil }
func (m *mockSheepRepo) UpdateType(ctx context.Context, id string, t *sheepDomain.SheepType) error { return nil }
func (m *mockSheepRepo) GetMatingStatusData(ctx context.Context) (map[string]bool, map[string]bool, map[string]string, error) { return nil, nil, nil, nil }

type mockTaskRepo struct {
	tasks []*tasksDomain.Task
}
func (m *mockTaskRepo) FindTasksByAccount(ctx context.Context, idAccount, roleName string, date *time.Time) ([]*tasksDomain.Task, error) { return nil, nil }
func (m *mockTaskRepo) FindByID(ctx context.Context, id string) (*tasksDomain.Task, error) { return nil, nil }
func (m *mockTaskRepo) StoreTask(ctx context.Context, t *tasksDomain.Task) error {
	m.tasks = append(m.tasks, t)
	return nil
}
func (m *mockTaskRepo) UpdateTask(ctx context.Context, t *tasksDomain.Task) error { return nil }
func (m *mockTaskRepo) UpdateTaskStatus(ctx context.Context, id string, status string) error { return nil }
func (m *mockTaskRepo) DeleteTask(ctx context.Context, id string) error { return nil }
func (m *mockTaskRepo) FindByScheduleAndDate(ctx context.Context, scheduleID string, taskDate time.Time) (*tasksDomain.Task, error) { return nil, nil }


func TestRecordFeeding(t *testing.T) {
	feedRepo := &mockFeedRepo{
		feeds: map[string]*domain.Feed{
			"feed-1": {IDFeed: "feed-1", FeedName: "Rumput Gajah", AvailableStock: 100},
			"feed-2": {IDFeed: "feed-2", FeedName: "Konsentrat A", AvailableStock: 5},
		},
		stockUpdates: make(map[string]float64),
	}
	sheepRepo := &mockSheepRepo{
		sheeps: map[string]*sheepDomain.Sheep{
			"sheep-1": {IDSheep: "sheep-1", SheepName: "Timmy"},
		},
	}
	taskRepo := &mockTaskRepo{}

	uc := NewUseCase(feedRepo, sheepRepo, taskRepo)

	feeding := &domain.Feeding{
		IDSheep:     "sheep-1",
		IDFeed:      "feed-1",
		Amount:      10,
		FeedingDate: time.Now(),
	}

	err := uc.RecordFeeding(context.Background(), feeding)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if feedRepo.stockUpdates["feed-1"] != -10 {
		t.Errorf("Expected feed stock to be reduced by 10, got %v", feedRepo.stockUpdates["feed-1"])
	}

	// Test insufficient stock
	feedingLow := &domain.Feeding{
		IDSheep:     "sheep-1",
		IDFeed:      "feed-2",
		Amount:      10,
	}
	errLow := uc.RecordFeeding(context.Background(), feedingLow)
	if errLow == nil {
		t.Errorf("Expected error for insufficient stock")
	}
}

func TestUpdateFeedStock(t *testing.T) {
	feedRepo := &mockFeedRepo{
		feeds: map[string]*domain.Feed{
			"feed-1": {IDFeed: "feed-1", AvailableStock: 100},
		},
		stockUpdates: make(map[string]float64),
	}
	uc := NewUseCase(feedRepo, nil, nil)

	_, err := uc.UpdateFeedStock(context.Background(), "feed-1", 50, "tambah")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if feedRepo.stockUpdates["feed-1"] != 50 {
		t.Errorf("Expected +50 stock, got %v", feedRepo.stockUpdates["feed-1"])
	}

	_, err = uc.UpdateFeedStock(context.Background(), "feed-1", 20, "kurang")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}
	if feedRepo.stockUpdates["feed-1"] != 30 { // 50 - 20 = 30
		t.Errorf("Expected +30 stock, got %v", feedRepo.stockUpdates["feed-1"])
	}
}
