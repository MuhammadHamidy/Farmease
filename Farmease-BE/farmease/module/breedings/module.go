package breedings

import (
	"github.com/farmease/farmease-be/farmease/module/breedings/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/farmease/module/breedings/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/breedings/usecase"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.BreedingRepository)),
		),
		func(
			repo domain.BreedingRepository,
			sheepRepo sheepDomain.SheepRepository,
			taskRepo tasksDomain.TaskRepository,
		) domain.UseCase {
			return usecase.NewUseCase(repo, sheepRepo, taskRepo)
		},
		http.NewBreedingHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.BreedingHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
