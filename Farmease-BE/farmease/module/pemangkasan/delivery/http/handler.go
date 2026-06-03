package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/pemangkasan/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PemangkasanHandler struct {
	usecase domain.PemangkasanUsecase
}

func NewPemangkasanHandler(usecase domain.PemangkasanUsecase) *PemangkasanHandler {
	return &PemangkasanHandler{usecase: usecase}
}

func (h *PemangkasanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pemangkasan")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PemangkasanHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all prunings", list)
}

func (h *PemangkasanHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Pruning not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get pruning", p)
}

func (h *PemangkasanHandler) Create(c *fiber.Ctx) error {
	var p domain.Pemangkasan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create pruning", p)
}

func (h *PemangkasanHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Pemangkasan
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPemangkasan = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update pruning", p)
}

func (h *PemangkasanHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete pruning", nil)
}

