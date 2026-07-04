package config

import (
	"github.com/farmease/kebun-be/framework/bunnymq"
	"github.com/farmease/kebun-be/framework/common/logger"
	"github.com/farmease/kebun-be/framework/fiber"
	"github.com/farmease/kebun-be/framework/otel"
	"github.com/farmease/kebun-be/framework/postgres"
	"github.com/farmease/kebun-be/framework/redis"
	"github.com/farmease/kebun-be/libraries/consumer"
)

type ApplicationConfig struct {
	AppConfig InternalAppConfig `config:",squash"`
	Postgres  postgres.Config   `config:",squash"`
	Redis     redis.Config      `config:",squash"`
	RabbitMQ  bunnymq.Config    `config:",squash"`
	Fiber     fiber.Config      `config:",squash"`
	Consumer  consumer.Config   `config:",squash"`
	Otel      otel.Config       `config:",squash"`
	Logger    logger.Config     `config:",squash"`
}

type InternalAppConfig struct {
	RedirectUrl     string `config:"redirectUrl"`
	JwtSecret       string `config:"jwtSecret"`
	LivestockAPIURL string `config:"livestockApiUrl"`
	SsoApiUrl       string `config:"ssoApiUrl"`
}

func Postgres(app *ApplicationConfig) *postgres.Config {
	return &app.Postgres
}

func Redis(app *ApplicationConfig) *redis.Config {
	return &app.Redis
}

func RabbitMQ(app *ApplicationConfig) *bunnymq.Config {
	return &app.RabbitMQ
}

func Fiber(app *ApplicationConfig) *fiber.Config {
	return &app.Fiber
}

func Consumer(app *ApplicationConfig) *consumer.Config {
	return &app.Consumer
}

func Otel(app *ApplicationConfig) *otel.Config {
	return &app.Otel
}

func Logger(app *ApplicationConfig) *logger.Config {
	return &app.Logger
}

func InternalApp(app *ApplicationConfig) *InternalAppConfig {
	return &app.AppConfig
}

