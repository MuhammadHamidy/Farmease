package auth

import (
	"github.com/farmease/farmease-be/farmease/config"
	"github.com/farmease/farmease-be/farmease/module/auth/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/auth/domain"
	"github.com/farmease/farmease-be/farmease/module/auth/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/auth/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		fx.Annotate(
			postgresql.NewRepository,
			fx.As(new(domain.AuthRepository)),
		),
		func(repo domain.AuthRepository, appConfig *config.InternalAppConfig) domain.UseCase {
			secret := "farmease-secret" // Default secret
			if appConfig.JwtSecret != "" {
				secret = appConfig.JwtSecret
			}
			return usecase.NewUseCase(repo, secret)
		},
		http.NewAuthHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.AuthHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
