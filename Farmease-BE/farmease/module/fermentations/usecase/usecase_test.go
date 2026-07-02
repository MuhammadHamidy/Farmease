package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	feedsDomain "github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
)

// --- Mock FermentationRepository ---
type mockFermentationRepo struct {
	logs       map[string]*domain.SilageFermentationLog
	targetFeed map[string]struct {
		id     string
		amount float64
	}
}

func (m *mockFermentationRepo) StoreLog(ctx context.Context, log *domain.SilageFermentationLog) error {
	if log.IDLog == "" {
		log.IDLog = "log-1"
	}
	m.logs[log.IDLog] = log
	return nil
}

func (m *mockFermentationRepo) FindLogsByConversionID(ctx context.Context, conversionID string) ([]*domain.SilageFermentationLog, error) {
	var res []*domain.SilageFermentationLog
	for _, l := range m.logs {
		if l.IDConversion == conversionID {
			res = append(res, l)
		}
	}
	return res, nil
}

func (m *mockFermentationRepo) FindLatestLogByConversionID(ctx context.Context, conversionID string) (*domain.SilageFermentationLog, error) {
	return nil, nil // Not heavily used in CreateLog if we mock GetConversionTarget
}

func (m *mockFermentationRepo) GetConversionTarget(ctx context.Context, conversionID string) (string, float64, error) {
	if t, ok := m.targetFeed[conversionID]; ok {
		return t.id, t.amount, nil
	}
	return "", 0, errors.New("conversion target not found")
}

// --- Mock FeedRepository ---
type mockFeedRepo struct {
	stockUpdates map[string]float64
}

func (m *mockFeedRepo) FindAllMaster(ctx context.Context) ([]*feedsDomain.Feed, error) { return nil, nil }
func (m *mockFeedRepo) FindMasterByID(ctx context.Context, id string) (*feedsDomain.Feed, error) { return nil, nil }
func (m *mockFeedRepo) StoreMaster(ctx context.Context, p *feedsDomain.Feed) error { return nil }
func (m *mockFeedRepo) StoreFeeding(ctx context.Context, f *feedsDomain.Feeding) error { return nil }
func (m *mockFeedRepo) FindFeedingHistory(ctx context.Context, idSheep string) ([]*feedsDomain.Feeding, error) { return nil, nil }
func (m *mockFeedRepo) FindAllFeedings(ctx context.Context, filter feedsDomain.FeedingFilter) ([]*feedsDomain.Feeding, int, error) { return nil, 0, nil }
func (m *mockFeedRepo) StoreFeedingMixture(ctx context.Context, fm *feedsDomain.FeedingMixture) error { return nil }
func (m *mockFeedRepo) StoreSilageConversion(ctx context.Context, sc *feedsDomain.SilageConversion) error { return nil }
func (m *mockFeedRepo) FindAllSilageConversions(ctx context.Context) ([]*feedsDomain.SilageConversion, error) { return nil, nil }

func (m *mockFeedRepo) UpdateStock(ctx context.Context, id string, amount float64, actionType string) error {
	if actionType == "tambah" {
		m.stockUpdates[id] += amount
	} else if actionType == "kurang" {
		m.stockUpdates[id] -= amount
	}
	return nil
}

// --- Tests ---

func TestCreateLog_Success_Siap(t *testing.T) {
	ferRepo := &mockFermentationRepo{
		logs: make(map[string]*domain.SilageFermentationLog),
		targetFeed: map[string]struct {
			id     string
			amount float64
		}{
			"conv-1": {id: "feed-target-1", amount: 150.5},
		},
	}
	feedRepo := &mockFeedRepo{
		stockUpdates: make(map[string]float64),
	}
	uc := NewUseCase(ferRepo, feedRepo)

	log := &domain.SilageFermentationLog{
		IDConversion: "conv-1",
		Status:       "siap",
		CheckDate:    time.Now(),
	}

	err := uc.CreateLog(context.Background(), log)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	// Because status is "siap", it should add to feed stock
	if addedStock, ok := feedRepo.stockUpdates["feed-target-1"]; !ok || addedStock != 150.5 {
		t.Errorf("Expected feed stock to be updated by 150.5, got %v", addedStock)
	}
}

func TestCreateLog_Success_Proses(t *testing.T) {
	ferRepo := &mockFermentationRepo{
		logs: make(map[string]*domain.SilageFermentationLog),
	}
	feedRepo := &mockFeedRepo{
		stockUpdates: make(map[string]float64),
	}
	uc := NewUseCase(ferRepo, feedRepo)

	log := &domain.SilageFermentationLog{
		IDConversion: "conv-1",
		Status:       "fermentasi",
		CheckDate:    time.Now(),
	}

	err := uc.CreateLog(context.Background(), log)
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	// Should NOT update feed stock if status is not "siap"
	if len(feedRepo.stockUpdates) > 0 {
		t.Errorf("Expected no feed stock updates, got %d updates", len(feedRepo.stockUpdates))
	}
}

func TestGetLogs(t *testing.T) {
	ferRepo := &mockFermentationRepo{
		logs: map[string]*domain.SilageFermentationLog{
			"log-1": {IDLog: "log-1", IDConversion: "conv-1", Status: "fermentasi"},
			"log-2": {IDLog: "log-2", IDConversion: "conv-1", Status: "siap"},
			"log-3": {IDLog: "log-3", IDConversion: "conv-2", Status: "gagal"},
		},
	}
	uc := NewUseCase(ferRepo, nil)

	logs, err := uc.GetLogs(context.Background(), "conv-1")
	if err != nil {
		t.Errorf("Expected nil error, got %v", err)
	}

	if len(logs) != 2 {
		t.Errorf("Expected 2 logs, got %d", len(logs))
	}
}
