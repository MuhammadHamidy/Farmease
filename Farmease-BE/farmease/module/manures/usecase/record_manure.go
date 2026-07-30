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

func (event *manureDistributedEvent) Exchange() string    { return "farmease.exchange" }
func (event *manureDistributedEvent) Topic() string       { return "livestock.manure.distributed" }
func (event *manureDistributedEvent) MessageId() string   { return event.ID }
func (event *manureDistributedEvent) ContentType() string { return "application/json" }
func (event *manureDistributedEvent) Body() []byte {
	bytes, _ := json.Marshal(event)
	return bytes
}

// RecordManure logs a manure collection or distribution event.
func (u *useCase) RecordManure(ctx context.Context, manure *domain.Manure) error {
	err := u.repo.Store(ctx, manure)
	if err != nil {
		return err
	}

	// Publish event only if this is distributed to internal kebun, and publisher is available
	if manure.ActivityType == "distribution" && manure.DestinationType == "internal_kebun" && u.publisher != nil {
		event := &manureDistributedEvent{
			ID:        manure.IDManure,
			Amount:    manure.Amount,
			Unit:      manure.Unit,
			Notes:     manure.Notes,
			Timestamp: time.Now(),
		}
		
		log.Info().Str("manure_id", manure.IDManure).Msg("Publishing manure distribution event to RabbitMQ...")
		if pubErr := u.publisher.Publish(ctx, event); pubErr != nil {
			log.Error().Err(pubErr).Str("manure_id", manure.IDManure).Msg("Failed to publish manure distribution event to RabbitMQ")
		} else {
			log.Info().Str("manure_id", manure.IDManure).Msg("Successfully published manure distribution event")
		}
	}

	return nil
}
