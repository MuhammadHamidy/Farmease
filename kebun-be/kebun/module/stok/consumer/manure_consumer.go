package consumer

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/farmease/kebun-be/kebun/module/stok/domain"
	"github.com/farmease/kebun-be/framework/bunnymq"
	libConsumer "github.com/farmease/kebun-be/libraries/consumer"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rs/zerolog/log"
	"go.uber.org/fx"
)

type ManureConsumer struct {
	rmq      *bunnymq.RabbitMQ
	c        *libConsumer.Consumer
	stokRepo domain.StokRepository
}

type ManureEvent struct {
	ID        string    `json:"id_manure"`
	Amount    float64   `json:"amount"`
	Unit      string    `json:"unit"`
	Notes     string    `json:"notes"`
	Timestamp time.Time `json:"timestamp"`
}

func NewManureConsumer(lc fx.Lifecycle, rmq *bunnymq.RabbitMQ, c *libConsumer.Consumer, repo domain.StokRepository) *ManureConsumer {
	mc := &ManureConsumer{
		rmq:      rmq,
		c:        c,
		stokRepo: repo,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go mc.Start(context.Background())
			return nil
		},
	})

	return mc
}

func (mc *ManureConsumer) Start(ctx context.Context) {
	log.Info().Msg("Starting ManureConsumer background startup loop...")

	// 1. Wait until connection is established
	var conn *amqp.Connection
	for {
		conn = mc.rmq.Connection()
		if conn != nil && !conn.IsClosed() {
			break
		}
		log.Info().Msg("ManureConsumer waiting for RabbitMQ connection...")
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
		"kebun.manure.queue", // name
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to declare queue 'kebun.manure.queue'")
		return
	}

	// Bind Queue to Exchange with Routing Key
	err = ch.QueueBind(
		"kebun.manure.queue",            // queue name
		"livestock.manure.distributed", // routing key
		"farmease.exchange",             // exchange
		false,
		nil,
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to bind queue to exchange")
		return
	}

	log.Info().Msg("Successfully declared exchange, queue, and bindings. Starting consume loop...")

	// Start consuming
	mc.c.Consume(ctx, "kebun.manure.queue", mc.HandleMessage)
}

func (mc *ManureConsumer) HandleMessage(ctx context.Context, msg amqp.Delivery) error {
	log.Info().Str("msg_id", msg.MessageId).Msg("Received manure distribution event from RabbitMQ")

	var event ManureEvent
	if err := json.Unmarshal(msg.Body, &event); err != nil {
		log.Error().Err(err).Msg("Failed to unmarshal manure event payload")
		return err // return error so it nacks/requeues if invalid
	}

	log.Info().Float64("amount", event.Amount).Str("unit", event.Unit).Msg("Processing manure distribution event...")

	// Find all fertilizers in Perkebunan to see if "Pupuk Kotoran Domba" exists
	fertilizers, err := mc.stokRepo.FindAllPupuk(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to list existing fertilizers in Perkebunan")
		return err
	}

	var targetPupuk *domain.StokPupuk
	for _, p := range fertilizers {
		if strings.EqualFold(p.NamaPupuk, "Pupuk Kotoran Domba") {
			targetPupuk = p
			break
		}
	}

	// Update or insert pupuk stock
	if targetPupuk != nil {
		log.Info().Str("pupuk_id", targetPupuk.IDStokPupuk).Msg("Updating existing fertilizer stock 'Pupuk Kotoran Domba'")
		err = mc.stokRepo.UpdatePupukStock(ctx, targetPupuk.IDStokPupuk, event.Amount, "tambah")
		if err != nil {
			log.Error().Err(err).Msg("Failed to update organic fertilizer stock")
			return err
		}
	} else {
		log.Info().Msg("Creating new fertilizer stock record 'Pupuk Kotoran Domba'")
		newPupuk := &domain.StokPupuk{
			NamaPupuk:    "Pupuk Kotoran Domba",
			Kategori:     "Organik",
			StokTersedia: event.Amount,
			Satuan:       event.Unit,
		}
		err = mc.stokRepo.StorePupuk(ctx, newPupuk)
		if err != nil {
			log.Error().Err(err).Msg("Failed to store new organic fertilizer stock")
			return err
		}
	}

	log.Info().Msg("Successfully processed manure distribution event")
	return nil
}
