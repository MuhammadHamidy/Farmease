package http

import (
	"github.com/farmease/farmease-be/farmease/module/pembuahan/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PembuahanHandler struct {
	usecase domain.PembuahanUsecase
}

func NewPembuahanHandler(usecase domain.PembuahanUsecase) *PembuahanHandler {
	return &PembuahanHandler{usecase: usecase}
}

func (h *PembuahanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pembuahan")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PembuahanHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all fruiting records", list)
}

func (h *PembuahanHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Fruiting record not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get fruiting record", p)
}

func (h *PembuahanHandler) Create(c *fiber.Ctx) error {
	var p domain.Pembuahan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create fruiting record", p)
}

func (h *PembuahanHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Pembuahan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPembuahan = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update fruiting record", p)
}

func (h *PembuahanHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete fruiting record", nil)
}
