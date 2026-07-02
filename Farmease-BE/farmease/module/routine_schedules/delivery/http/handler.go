package http

import (
	"github.com/farmease/farmease-be/farmease/module/routine_schedules/domain"
	"github.com/gofiber/fiber/v2"
)


type RoutineScheduleHandler struct {
	useCase domain.RoutineScheduleUsecase
}

func NewRoutineScheduleHandler(useCase domain.RoutineScheduleUsecase) *RoutineScheduleHandler {
	return &RoutineScheduleHandler{useCase: useCase}
}

func (h *RoutineScheduleHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	schedules := api.Group("/routine-schedules")
	schedules.Get("/", h.FindAll)
	schedules.Get("/:id", h.FindByID)
	schedules.Post("/", h.Create)
	schedules.Put("/:id", h.Update)
	schedules.Delete("/:id", h.Delete)
	schedules.Post("/generate", h.Generate)
}
