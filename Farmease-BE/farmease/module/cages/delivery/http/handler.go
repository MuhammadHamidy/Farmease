package http

import (
	"github.com/farmease/farmease-be/farmease/module/cages/domain"
	"github.com/gofiber/fiber/v2"
)

type CageHandler struct {
	useCase domain.UseCase
}

func NewCageHandler(useCase domain.UseCase) *CageHandler {
	return &CageHandler{useCase: useCase}
}

func (h *CageHandler) RegisterRoutes(app *fiber.App) {
	cages := app.Group("/api/cages")
	h.registerGroup(cages)

	kandang := app.Group("/api/kandang")
	h.registerGroup(kandang)
}

func (h *CageHandler) registerGroup(group fiber.Router) {
	group.Get("/", h.GetCageList)
	group.Post("/", h.CreateCage)
	group.Get("/verify/:code", h.VerifyCage)
	group.Get("/:id/stats", h.GetCageStats)
	group.Get("/:id/weight-stats", h.GetCageWeightStats)
	group.Get("/:id", h.GetCageDetail)
	group.Put("/:id", h.UpdateCage)
	group.Delete("/:id", h.DeleteCage)
}
