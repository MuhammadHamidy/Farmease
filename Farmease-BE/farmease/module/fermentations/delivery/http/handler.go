package http

import (
	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
	"github.com/gofiber/fiber/v2"
)

type FermentationHandler struct {
	useCase domain.UseCase
}

func NewFermentationHandler(useCase domain.UseCase) *FermentationHandler {
	return &FermentationHandler{useCase: useCase}
}

func (h *FermentationHandler) RegisterRoutes(app *fiber.App) {
	group := app.Group("/api/fermentations/conversions/:id/logs")
	group.Get("/", h.GetFermentationLogs)
	group.Post("/", h.CreateFermentationLog)
}
