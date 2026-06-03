package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/panen/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PanenHandler struct {
	usecase domain.PanenUsecase
}

func NewPanenHandler(usecase domain.PanenUsecase) *PanenHandler {
	return &PanenHandler{usecase: usecase}
}

func (h *PanenHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/panen")
	api.Get("/", h.FindAll)
	api.Get("/rekap", h.FindRekap) // Registered before :id to prevent wildcard conflicts
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PanenHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all harvest records", list)
}

func (h *PanenHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Harvest record not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get harvest record", p)
}

func (h *PanenHandler) FindRekap(c *fiber.Ctx) error {
	list, err := h.usecase.FindRekap(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get annual harvest rekap", list)
}

func (h *PanenHandler) Create(c *fiber.Ctx) error {
	var p domain.Panen
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create harvest record", p)
}

func (h *PanenHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Panen
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPanen = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update harvest record", p)
}

func (h *PanenHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete harvest record", nil)
}

