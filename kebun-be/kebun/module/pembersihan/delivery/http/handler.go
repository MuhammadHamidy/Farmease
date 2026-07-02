package http

import (
	"github.com/farmease/farmease-be/farmease/module/pembersihan/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PembersihanHandler struct {
	usecase domain.PembersihanUsecase
}

func NewPembersihanHandler(usecase domain.PembersihanUsecase) *PembersihanHandler {
	return &PembersihanHandler{usecase: usecase}
}

func (h *PembersihanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pembersihan")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PembersihanHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all cleaning records", list)
}

func (h *PembersihanHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Cleaning record not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get cleaning record", p)
}

func (h *PembersihanHandler) Create(c *fiber.Ctx) error {
	var p domain.Pembersihan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create cleaning record", p)
}

func (h *PembersihanHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Pembersihan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPembersihan = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update cleaning record", p)
}

func (h *PembersihanHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete cleaning record", nil)
}
