package healths

import (
	"github.com/farmease/farmease-be/farmease/module/healths/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
	"github.com/farmease/farmease-be/farmease/module/healths/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/healths/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.HealthRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewHealthHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.HealthHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
