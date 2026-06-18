package http

import (
	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/gofiber/fiber/v2"
)

type SheepHandler struct {
	useCase domain.UseCase
}

func NewSheepHandler(useCase domain.UseCase) *SheepHandler {
	return &SheepHandler{useCase: useCase}
}

func (h *SheepHandler) RegisterRoutes(app *fiber.App) {
	sheep := app.Group("/api/sheep")
	h.registerGroup(sheep)

	domba := app.Group("/api/domba")
	h.registerGroup(domba)
}

func (h *SheepHandler) registerGroup(group fiber.Router) {
	group.Get("/", h.GetSheepList)
	group.Post("/", h.RegisterSheep)
	group.Post("/external-donor", h.RegisterExternalDonor)
	group.Get("/:id", h.GetSheepDetail)
	group.Put("/:id", h.UpdateSheep)
	group.Patch("/:id/status", h.UpdateSheepStatus)
	group.Get("/:id/genealogy", h.GetSheepGenealogy)
	group.Get("/:id/silsilah", h.GetSheepGenealogy)
}
