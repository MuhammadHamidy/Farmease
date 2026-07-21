package http

import (
	"github.com/farmease/kebun-be/kebun/module/fermentasi/domain"
	"github.com/farmease/kebun-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog/log"
)

type FermentasiHandler struct {
	usecase domain.FermentasiUsecase
}

func NewFermentasiHandler(usecase domain.FermentasiUsecase) *FermentasiHandler {
	return &FermentasiHandler{usecase: usecase}
}

func (h *FermentasiHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/fermentasi")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Patch("/:id/status", h.UpdateStatus)
	api.Post("/log", h.AddLog)
}

func (h *FermentasiHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all fermentation records", list)
}

func (h *FermentasiHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	f, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if f == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Fermentation record not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get fermentation record", f)
}

func (h *FermentasiHandler) Create(c *fiber.Ctx) error {
	var f domain.Fermentasi
	if err := c.BodyParser(&f); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.CreatePupukFermentasi(c.Context(), &f); err != nil {
		log.Error().Err(err).Interface("payload", f).Msg("Failed to create fermentation batch")
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create fermentation batch", f)
}

func (h *FermentasiHandler) UpdateStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	
	type Req struct {
		Status string `json:"status"`
		Notes  string `json:"notes"`
	}
	var r Req
	if err := c.BodyParser(&r); err != nil {
		// Fallback to queries
		r.Status = c.Query("status")
		r.Notes = c.Query("notes")
	}

	if r.Status == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Status is required")
	}

	if err := h.usecase.UpdateStatus(c.Context(), id, r.Status, r.Notes); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update fermentation status", nil)
}

func (h *FermentasiHandler) AddLog(c *fiber.Ctx) error {
	var l domain.LogFermentasi
	if err := c.BodyParser(&l); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if l.IDFermentasi == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "id_fermentasi is required")
	}
	if err := h.usecase.AddLog(c.Context(), &l); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success add check log for fermentation", l)
}

