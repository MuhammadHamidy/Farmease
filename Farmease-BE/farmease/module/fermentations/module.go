package fermentations

import (
	"github.com/farmease/farmease-be/farmease/module/fermentations/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
	"github.com/farmease/farmease-be/farmease/module/fermentations/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/fermentations/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.FermentationRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewFermentationHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.FermentationHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
