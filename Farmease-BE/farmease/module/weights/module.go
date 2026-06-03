package weights

import (
	"github.com/farmease/farmease-be/farmease/module/weights/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
	"github.com/farmease/farmease-be/farmease/module/weights/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/weights/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.WeightRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewWeightHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.WeightHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
