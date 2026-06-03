package feeds

import (
	"github.com/farmease/farmease-be/farmease/module/feeds/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/farmease/module/feeds/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/feeds/usecase"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.FeedRepository)),
		),
		func(repo domain.FeedRepository, sheepRepo sheepDomain.SheepRepository) domain.UseCase {
			return usecase.NewUseCase(repo, sheepRepo)
		},
		http.NewFeedHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.FeedHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
