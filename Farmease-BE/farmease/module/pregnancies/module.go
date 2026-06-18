package pregnancies

import (
	breedingDomain "github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/usecase"
	sheepDomain "github.com/farmease/farmease-be/farmease/module/sheep/domain"
	tasksDomain "github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.PregnancyRepository)),
		),
		func(
			repo domain.PregnancyRepository,
			sheepRepo sheepDomain.SheepRepository,
			matingRepo breedingDomain.BreedingRepository,
			taskRepo tasksDomain.TaskRepository,
		) domain.UseCase {
			return usecase.NewUseCase(repo, sheepRepo, matingRepo, taskRepo)
		},
		http.NewPregnancyHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.PregnancyHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
