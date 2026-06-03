package sheep

import (
	"github.com/farmease/farmease-be/farmease/module/sheep/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/farmease/farmease-be/farmease/module/sheep/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/sheep/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.SheepRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewSheepHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.SheepHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
