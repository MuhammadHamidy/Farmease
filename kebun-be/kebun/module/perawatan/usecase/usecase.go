package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/config"
	"github.com/farmease/kebun-be/kebun/module/perawatan/domain"
	"github.com/farmease/kebun-be/libraries/publisher"
	"github.com/rs/zerolog/log"
)

type perawatanUsecase struct {
	repo      domain.PerawatanRepository
	cfg       *config.InternalAppConfig
	publisher *publisher.Publisher
}

func NewPerawatanUsecase(repo domain.PerawatanRepository, cfg *config.InternalAppConfig, pub *publisher.Publisher) domain.PerawatanUsecase {
	return &perawatanUsecase{repo: repo, cfg: cfg, publisher: pub}
}

func (u *perawatanUsecase) FindAll(ctx context.Context) ([]domain.Perawatan, error) {
	return u.repo.FindAll(ctx)
}

func (u *perawatanUsecase) FindByID(ctx context.Context, id string) (*domain.Perawatan, error) {
	return u.repo.FindByID(ctx, id)
}

type ManureItem struct {
	IDManure string `json:"id_manure"`
	Tipe     string `json:"tipe"`
	Jumlah   int    `json:"jumlah"`
	Satuan   string `json:"satuan"`
}

type ManureResponse struct {
	Status  string       `json:"status"`
	Message string       `json:"message"`
	Data    []ManureItem `json:"data"`
}

type cropResidueEvent struct {
	ID        string    `json:"id_event"`
	FeedName  string    `json:"feed_name"`
	Amount    float64   `json:"amount"`
	Unit      string    `json:"unit"`
	Notes     string    `json:"notes"`
	Timestamp time.Time `json:"timestamp"`
}

func (e *cropResidueEvent) Exchange() string    { return "farmease.exchange" }
func (e *cropResidueEvent) Topic() string       { return "gardening.crop_residue.distributed" }
func (e *cropResidueEvent) MessageId() string   { return e.ID }
func (e *cropResidueEvent) ContentType() string { return "application/json" }
func (e *cropResidueEvent) Body() []byte {
	bytes, _ := json.Marshal(e)
	return bytes
}

func (u *perawatanUsecase) Create(ctx context.Context, p *domain.Perawatan) error {
	// If technique is Pemupukan (Fertilization), integrate manure from external Livestock Web API
	if p.NamaJenisAktivitas == "Pemupukan" {
		u.fetchManureFromLivestock()
	}

	err := u.repo.Store(ctx, p)
	if err != nil {
		return err
	}

	// Publish to RabbitMQ if this is a Pembersihan (cleaning) activity and intended as livestock feed
	// We detect this if the description/notes contains "Pakan Ternak" (case-insensitive)
	if p.NamaJenisAktivitas == "Pembersihan" && u.publisher != nil {
		isFeed := strings.Contains(strings.ToLower(p.Deskripsi), "pakan ternak") || 
			strings.Contains(strings.ToLower(p.NamaRincianAktivitas), "pakan")
		
		if isFeed {
			feedName := "Gulma / Rumput Liar (Mentah)"
			rincian := strings.ToLower(p.NamaRincianAktivitas)
			if strings.Contains(rincian, "serasah") || strings.Contains(rincian, "ranting") {
				// Detect tree leaf type based on description/notes if possible, default to avocado leaf
				if strings.Contains(strings.ToLower(p.Deskripsi), "kelengkeng") {
					feedName = "Daun Kelengkeng (Mentah)"
				} else {
					feedName = "Daun Alpukat (Mentah)"
				}
			}

			// Publish event
			evt := &cropResidueEvent{
				ID:        p.IDPerawatan,
				FeedName:  feedName,
				Amount:    p.Dosis, // dosage represents quantity for cleaning/pemupukan
				Unit:      p.Satuan,
				Notes:     p.Deskripsi,
				Timestamp: time.Now(),
			}
			log.Info().Str("feed_name", feedName).Msg("Publishing crop residue event from Pembersihan to RabbitMQ...")
			if pubErr := u.publisher.Publish(ctx, evt); pubErr != nil {
				log.Error().Err(pubErr).Str("feed_name", feedName).Msg("Failed to publish crop residue event")
			} else {
				log.Info().Str("feed_name", feedName).Msg("Successfully published crop residue event")
			}
		}
	}

	return nil
}

func (u *perawatanUsecase) Update(ctx context.Context, p *domain.Perawatan) error {
	if p.NamaJenisAktivitas == "Pemupukan" {
		u.fetchManureFromLivestock()
	}
	return u.repo.Update(ctx, p)
}

func (u *perawatanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

func (u *perawatanUsecase) GetRekomendasiObat(ctx context.Context, varietas, fase, obat string) (string, error) {
	if varietas == "" {
		varietas = "Alpukat Aligator"
	}
	if fase == "" || fase == "Fase Pohon" {
		fase = "Vegetatif"
	}
	if obat == "" {
		obat = "Ekstrak Nimba"
	}
	return fmt.Sprintf("Varietas <strong>%s</strong> dengan fase <strong>%s</strong> menggunakan <strong>%s</strong> dengan dosesi sebanyak <strong>2-3 mL/Liter air</strong>.", varietas, fase, obat), nil
}

func (u *perawatanUsecase) fetchManureFromLivestock() {
	baseURL := u.cfg.LivestockAPIURL
	if baseURL == "" {
		baseURL = "http://localhost:8081/api/v1"
	}

	client := &http.Client{Timeout: 3 * time.Second}
	url := fmt.Sprintf("%s/manures", baseURL)

	resp, err := client.Get(url)
	if err != nil {
		fmt.Printf("[Warning] Failed to fetch manure from Livestock API: %v\n", err)
		return
	}
	defer resp.Body.Close()

	var apiRes ManureResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiRes); err != nil {
		fmt.Printf("[Warning] Failed to parse manure data from Livestock API: %v\n", err)
		return
	}

	fmt.Printf("[Info] Successfully fetched %d manure records from Livestock API\n", len(apiRes.Data))
}

