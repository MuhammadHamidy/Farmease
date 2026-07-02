package http

import (
	"github.com/farmease/farmease-be/farmease/module/penyiraman/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PenyiramanHandler struct {
	usecase domain.PenyiramanUsecase
}

func NewPenyiramanHandler(usecase domain.PenyiramanUsecase) *PenyiramanHandler {
	return &PenyiramanHandler{usecase: usecase}
}

func (h *PenyiramanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/penyiraman")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PenyiramanHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all watering records", list)
}

func (h *PenyiramanHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Watering record not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get watering record", p)
}

func (h *PenyiramanHandler) Create(c *fiber.Ctx) error {
	var p domain.Penyiraman
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create watering record", p)
}

func (h *PenyiramanHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Penyiraman
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPenyiraman = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update watering record", p)
}

func (h *PenyiramanHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete watering record", nil)
}
