package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/perawatan/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PerawatanHandler struct {
	usecase domain.PerawatanUsecase
}

func NewPerawatanHandler(usecase domain.PerawatanUsecase) *PerawatanHandler {
	return &PerawatanHandler{usecase: usecase}
}

func (h *PerawatanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/perawatan")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PerawatanHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all tree care records", list)
}

func (h *PerawatanHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Tree care record not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get tree care record", p)
}

func (h *PerawatanHandler) Create(c *fiber.Ctx) error {
	var p domain.Perawatan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create tree care record", p)
}

func (h *PerawatanHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Perawatan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPerawatan = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update tree care record", p)
}

func (h *PerawatanHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete tree care record", nil)
}

