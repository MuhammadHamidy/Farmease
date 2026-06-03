package cages

import (
	"github.com/farmease/farmease-be/farmease/module/cages/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
	"github.com/farmease/farmease-be/farmease/module/cages/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/cages/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.CageRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewCageHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.CageHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
