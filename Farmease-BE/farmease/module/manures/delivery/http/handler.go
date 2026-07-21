package http

import (
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
	"github.com/gofiber/fiber/v2"
)

type ManureHandler struct {
	useCase domain.UseCase
}

func NewManureHandler(useCase domain.UseCase) *ManureHandler {
	return &ManureHandler{useCase: useCase}
}

func (h *ManureHandler) RegisterRoutes(app *fiber.App) {
	// Global list endpoint
	app.Get("/api/manures", h.GetManureList)
	app.Get("/api/kotoran", h.GetManureList)

	// Sheep-specific sub-routes
	sheepManures := app.Group("/api/sheep/:id/manures")
	h.registerSheepGroup(sheepManures)

	sheepManureSingular := app.Group("/api/sheep/:id/manure")
	h.registerSheepGroup(sheepManureSingular)

	dombaKotoran := app.Group("/api/domba/:id/kotoran")
	h.registerSheepGroup(dombaKotoran)

	// Cage-specific sub-routes
	cageManures := app.Group("/api/cages/:id/manures")
	h.registerCageGroup(cageManures)

	cageManureSingular := app.Group("/api/cages/:id/manure")
	h.registerCageGroup(cageManureSingular)

	kandangKotoran := app.Group("/api/kandang/:id/kotoran")
	h.registerCageGroup(kandangKotoran)
}

func (h *ManureHandler) registerSheepGroup(group fiber.Router) {
	group.Get("/", h.GetManureHistory)
	group.Post("/", h.RecordManure)
}

func (h *ManureHandler) registerCageGroup(group fiber.Router) {
	group.Get("/", h.GetManureHistoryByCage)
	group.Post("/", h.RecordManureForCage)
}
