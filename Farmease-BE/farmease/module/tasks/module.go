package tasks

import (
	"github.com/farmease/farmease-be/farmease/module/tasks/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/farmease/farmease-be/farmease/module/tasks/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/tasks/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.TaskRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewTaskHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.TaskHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
