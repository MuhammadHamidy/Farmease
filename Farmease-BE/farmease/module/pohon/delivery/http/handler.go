package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/pohon/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type PohonHandler struct {
	usecase domain.PohonUsecase
}

func NewPohonHandler(usecase domain.PohonUsecase) *PohonHandler {
	return &PohonHandler{usecase: usecase}
}

func (h *PohonHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/pohon")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *PohonHandler) FindAll(c *fiber.Ctx) error {
	trees, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all trees", trees)
}

func (h *PohonHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	p, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if p == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Tree not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get tree", p)
}

func (h *PohonHandler) Create(c *fiber.Ctx) error {
	var p domain.Pohon
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create tree", p)
}

func (h *PohonHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var p domain.Pohon
	if err := c.BodyParser(&p); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	p.IDPohon = id
	if err := h.usecase.Update(c.Context(), &p); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update tree", p)
}

func (h *PohonHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete tree", nil)
}

