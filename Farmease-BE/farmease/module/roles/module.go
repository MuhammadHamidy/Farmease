package roles

import (
	gofiber "github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
	"github.com/farmease/farmease-be/farmease/module/roles/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/roles/domain"
	"github.com/farmease/farmease-be/farmease/module/roles/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/roles/usecase"
)

// Module exports the roles module for Fx.
var Module = fx.Options(
	fx.Provide(
		postgresql.NewRepository,
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.RoleRepository)),
		),
		usecase.NewUseCase,
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.UseCase)),
		),
		http.NewRoleHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.RoleHandler, app *gofiber.App) {
	h.RegisterRoutes(app)
}
