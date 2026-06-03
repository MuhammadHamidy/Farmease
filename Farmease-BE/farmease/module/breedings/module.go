package breedings

import (
	"github.com/farmease/farmease-be/farmease/module/breedings/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/farmease/module/breedings/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/breedings/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.BreedingRepository)),
		),
		func(repo domain.BreedingRepository) domain.UseCase {
			return usecase.NewUseCase(repo)
		},
		http.NewBreedingHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.BreedingHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
