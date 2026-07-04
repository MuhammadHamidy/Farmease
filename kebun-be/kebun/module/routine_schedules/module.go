package routine_schedules

import (
	"github.com/farmease/kebun-be/kebun/module/routine_schedules/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/routine_schedules/domain"
	"github.com/farmease/kebun-be/kebun/module/routine_schedules/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/routine_schedules/usecase"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		postgresql.NewRoutineScheduleRepository,
		fx.Annotate(
			usecase.NewUseCase,
			fx.As(new(domain.RoutineScheduleUsecase)),
		),
		http.NewRoutineScheduleHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.RoutineScheduleHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}

