package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/module/pemangkasan/domain"
	"github.com/farmease/kebun-be/libraries/publisher"
	"github.com/rs/zerolog/log"
)

type pemangkasanUsecase struct {
	repo      domain.PemangkasanRepository
	publisher *publisher.Publisher
}

func NewPemangkasanUsecase(repo domain.PemangkasanRepository, pub *publisher.Publisher) domain.PemangkasanUsecase {
	return &pemangkasanUsecase{repo: repo, publisher: pub}
}

func (u *pemangkasanUsecase) FindAll(ctx context.Context) ([]domain.Pemangkasan, error) {
	return u.repo.FindAll(ctx)
}

func (u *pemangkasanUsecase) FindByID(ctx context.Context, id string) (*domain.Pemangkasan, error) {
	return u.repo.FindByID(ctx, id)
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

func (u *pemangkasanUsecase) Create(ctx context.Context, p *domain.Pemangkasan) error {
	err := u.repo.Store(ctx, p)
	if err != nil {
		return err
	}

	// Publish to RabbitMQ if this is a Pemangkasan (pruning) activity
	if u.publisher != nil {
		rincian := strings.ToLower(p.NamaRincianAktivitas)
		var feedName string
		if strings.Contains(rincian, "gulma") || strings.Contains(rincian, "rumput") {
			feedName = "Hijauan Rumput / Gulma"
		} else if strings.Contains(rincian, "ranting") || strings.Contains(rincian, "daun") || strings.Contains(rincian, "pemangkasan") {
			if strings.Contains(rincian, "kelengkeng") {
				feedName = "Hijauan Daun Kelengkeng"
			} else {
				// Default to Avocado Leaf
				feedName = "Hijauan Daun Alpukat"
			}
		}

		if feedName != "" {
			qty := 0.0
			fmt.Sscanf(p.Jumlah, "%f", &qty) // parse string quantity to float64

			// If unit is gram, convert to kg to match livestock feed units
			unit := p.Satuan
			if strings.EqualFold(unit, "g") || strings.Contains(strings.ToLower(unit), "gram") {
				qty = qty / 1000.0
				unit = "kg"
			}

			evt := &cropResidueEvent{
				ID:        p.IDPemangkasan,
				FeedName:  feedName,
				Amount:    qty,
				Unit:      unit,
				Notes:     p.Keterangan,
				Timestamp: time.Now(),
			}
			log.Info().Str("feed_name", feedName).Msg("Publishing crop residue event from Pemangkasan to RabbitMQ...")
			if pubErr := u.publisher.Publish(ctx, evt); pubErr != nil {
				log.Error().Err(pubErr).Str("feed_name", feedName).Msg("Failed to publish crop residue event")
			} else {
				log.Info().Str("feed_name", feedName).Msg("Successfully published crop residue event")
			}
		}
	}

	return nil
}

func (u *pemangkasanUsecase) Update(ctx context.Context, p *domain.Pemangkasan) error {
	return u.repo.Update(ctx, p)
}

func (u *pemangkasanUsecase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}

