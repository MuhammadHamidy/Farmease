package usecase

import (
	"context"
	"encoding/json"
	"time"

	"github.com/farmease/farmease-be/farmease/module/manures/domain"
	"github.com/rs/zerolog/log"
)

type manureDistributedEvent struct {
	ID        string    `json:"id_manure"`
	Amount    float64   `json:"amount"`
	Unit      string    `json:"unit"`
	Notes     string    `json:"notes"`
	Timestamp time.Time `json:"timestamp"`
}

func (e *manureDistributedEvent) Exchange() string    { return "farmease.exchange" }
func (e *manureDistributedEvent) Topic() string       { return "livestock.manure.distributed" }
func (e *manureDistributedEvent) MessageId() string   { return e.ID }
func (e *manureDistributedEvent) ContentType() string { return "application/json" }
func (e *manureDistributedEvent) Body() []byte {
	bytes, _ := json.Marshal(e)
	return bytes
}

func (u *useCase) RecordManure(ctx context.Context, m *domain.Manure) error {
	err := u.repo.Store(ctx, m)
	if err != nil {
		return err
	}

	// Publish event only if this is distributed to internal kebun, and publisher is available
	if m.ActivityType == "distribution" && m.DestinationType == "internal_kebun" && u.publisher != nil {
		evt := &manureDistributedEvent{
			ID:        m.IDManure,
			Amount:    m.Amount,
			Unit:      m.Unit,
			Notes:     m.Notes,
			Timestamp: time.Now(),
		}
		
		log.Info().Str("manure_id", m.IDManure).Msg("Publishing manure distribution event to RabbitMQ...")
		if pubErr := u.publisher.Publish(ctx, evt); pubErr != nil {
			// Log publisher error but don't fail the REST transaction (user's record is already stored locally)
			log.Error().Err(pubErr).Str("manure_id", m.IDManure).Msg("Failed to publish manure distribution event to RabbitMQ")
		} else {
			log.Info().Str("manure_id", m.IDManure).Msg("Successfully published manure distribution event")
		}
	}

	return nil
}
