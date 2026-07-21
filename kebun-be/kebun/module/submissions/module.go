package submissions

import (
	"github.com/farmease/kebun-be/kebun/module/submissions/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/submissions/domain"
	"github.com/farmease/kebun-be/kebun/module/submissions/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/submissions/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.SubmissionRepository)),
		),
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewSubmissionHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.SubmissionHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}

