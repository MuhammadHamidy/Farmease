package fertilizers

import (
	http "github.com/farmease/farmease-be/farmease/module/fertilizers/delivery"
	"github.com/farmease/farmease-be/farmease/module/fertilizers/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		usecase.NewUseCase,
		http.NewHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(app *fiber.App, handler *http.FertilizersHandler) {
	api := app.Group("/api/fertilizers")
	
	api.Get("/recommendation", handler.GetRecommendation)
}
