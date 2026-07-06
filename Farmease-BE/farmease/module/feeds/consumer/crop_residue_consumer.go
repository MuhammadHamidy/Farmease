package consumer

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/framework/bunnymq"
	libConsumer "github.com/farmease/farmease-be/libraries/consumer"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rs/zerolog/log"
	"go.uber.org/fx"
)

type CropResidueConsumer struct {
	rmq      *bunnymq.RabbitMQ
	c        *libConsumer.Consumer
	feedRepo domain.FeedRepository
}

type CropResidueEvent struct {
	ID        string    `json:"id_event"`
	FeedName  string    `json:"feed_name"`
	Amount    float64   `json:"amount"`
	Unit      string    `json:"unit"`
	Notes     string    `json:"notes"`
	Timestamp time.Time `json:"timestamp"`
}

func NewCropResidueConsumer(lc fx.Lifecycle, rmq *bunnymq.RabbitMQ, c *libConsumer.Consumer, repo domain.FeedRepository) *CropResidueConsumer {
	crc := &CropResidueConsumer{
		rmq:      rmq,
		c:        c,
		feedRepo: repo,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go crc.Start(context.Background())
			return nil
		},
	})

	return crc
}

func (crc *CropResidueConsumer) Start(ctx context.Context) {
	log.Info().Msg("Starting CropResidueConsumer background startup loop...")

	// 1. Wait until connection is established
	var conn *amqp.Connection
	for {
		conn = crc.rmq.Connection()
		if conn != nil && !conn.IsClosed() {
			break
		}
		log.Info().Msg("CropResidueConsumer waiting for RabbitMQ connection...")
		select {
		case <-ctx.Done():
			return
		case <-time.After(2 * time.Second):
		}
	}

	// 2. Declare exchange, queue, and bind
	ch, err := conn.Channel()
	if err != nil {
		log.Error().Err(err).Msg("Failed to open channel to declare queue")
		return
	}
	defer ch.Close()

	// Declare Topic Exchange
	err = ch.ExchangeDeclare(
		"farmease.exchange", // name
		"topic",             // type
		true,                // durable
		false,               // auto-deleted
		false,               // internal
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to declare exchange 'farmease.exchange'")
		return
	}

	// Declare Queue
	_, err = ch.QueueDeclare(
		"peternakan.feed.queue", // name
		true,                    // durable
		false,                   // delete when unused
		false,                   // exclusive
		false,                   // no-wait
		nil,                     // arguments
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to declare queue 'peternakan.feed.queue'")
		return
	}

	// Bind Queue to Exchange with Routing Key
	err = ch.QueueBind(
		"peternakan.feed.queue",          // queue name
		"gardening.crop_residue.distributed", // routing key
		"farmease.exchange",              // exchange
		false,
		nil,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to bind queue to exchange")
		return
	}

	log.Info().Msg("Successfully declared exchange, queue, and bindings for feeds. Starting consume loop...")

	// Start consuming
	crc.c.Consume(ctx, "peternakan.feed.queue", crc.HandleMessage)
}

func (crc *CropResidueConsumer) HandleMessage(ctx context.Context, msg amqp.Delivery) error {
	log.Info().Str("msg_id", msg.MessageId).Msg("Received crop residue distributed event from RabbitMQ")

	var event CropResidueEvent
	if err := json.Unmarshal(msg.Body, &event); err != nil {
		log.Error().Err(err).Msg("Failed to unmarshal crop residue event payload")
		return err
	}

	log.Info().Str("feed_name", event.FeedName).Float64("amount", event.Amount).Str("unit", event.Unit).Msg("Processing crop residue event...")

	// Find all master feeds in Peternakan
	feeds, err := crc.feedRepo.FindAllMaster(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to list existing feeds in Peternakan")
		return err
	}

	var targetFeed *domain.Feed
	for _, f := range feeds {
		if strings.EqualFold(f.FeedName, event.FeedName) {
			targetFeed = f
			break
		}
	}

	if targetFeed != nil {
		log.Info().Str("feed_id", targetFeed.IDFeed).Msg("Updating existing feed stock in Peternakan")
		err = crc.feedRepo.UpdateStock(ctx, targetFeed.IDFeed, event.Amount, "tambah")
		if err != nil {
			log.Error().Err(err).Msg("Failed to update feed stock")
			return err
		}
	} else {
		log.Info().Str("feed_name", event.FeedName).Msg("Creating new master feed record in Peternakan")
		newFeed := &domain.Feed{
			FeedName:       event.FeedName,
			Category:       "hijauan",
			AvailableStock: event.Amount,
			Unit:           event.Unit,
			PricePerUnit:   0.00,
			Notes:          event.Notes,
		}
		err = crc.feedRepo.StoreMaster(ctx, newFeed)
		if err != nil {
			log.Error().Err(err).Msg("Failed to store new master feed record")
			return err
		}
	}

	log.Info().Msg("Successfully processed crop residue distributed event")
	return nil
}
