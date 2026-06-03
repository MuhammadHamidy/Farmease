package manures

import (
	"github.com/farmease/farmease-be/farmease/module/manures/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
	"github.com/farmease/farmease-be/farmease/module/manures/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/manures/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.ManureRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewManureHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.ManureHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
