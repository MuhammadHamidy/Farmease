package notifications

import (
	"github.com/farmease/farmease-be/farmease/module/notifications/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/farmease/module/notifications/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/notifications/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.NotificationRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewNotificationHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.NotificationHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
