package farms

import (
"github.com/gofiber/fiber/v2"
"github.com/farmease/farmease-be/farmease/module/farms/delivery/http"
"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/farmease/farmease-be/farmease/module/farms/repository/postgresql"
"github.com/farmease/farmease-be/farmease/module/farms/usecase"
"go.uber.org/fx"
)

// Module exports the farms module for Fx.
var Module = fx.Options(
fx.Provide(
postgresql.NewRepository,
fx.Annotate(
postgresql.NewRepository,
fx.As(new(domain.FarmRepository)),
),
usecase.NewUseCase,
fx.Annotate(
usecase.NewUseCase,
fx.As(new(domain.UseCase)),
),
http.NewFarmHandler,
),
fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.FarmHandler, app *fiber.App) {
h.RegisterRoutes(app)
}
