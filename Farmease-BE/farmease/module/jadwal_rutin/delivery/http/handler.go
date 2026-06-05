package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/jadwal_rutin/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type JadwalRutinHandler struct {
	usecase domain.JadwalRutinUsecase
}

func NewJadwalRutinHandler(usecase domain.JadwalRutinUsecase) *JadwalRutinHandler {
	return &JadwalRutinHandler{usecase: usecase}
}

func (h *JadwalRutinHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/jadwal-rutin")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *JadwalRutinHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all routine schedules", list)
}

func (h *JadwalRutinHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	pj, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if pj == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Routine schedule not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get routine schedule", pj)
}

func (h *JadwalRutinHandler) Create(c *fiber.Ctx) error {
	var pj domain.JadwalRutin
	if err := c.BodyParser(&pj); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &pj); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create routine schedule", pj)
}

func (h *JadwalRutinHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var pj domain.JadwalRutin
	if err := c.BodyParser(&pj); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	pj.IDJadwalRutin = id
	if err := h.usecase.Update(c.Context(), &pj); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update routine schedule", pj)
}

func (h *JadwalRutinHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete routine schedule", nil)
}

