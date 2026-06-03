package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/lahan/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type LahanHandler struct {
	usecase domain.LahanUsecase
}

func NewLahanHandler(usecase domain.LahanUsecase) *LahanHandler {
	return &LahanHandler{usecase: usecase}
}

func (h *LahanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/lahan")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Get("/kode/:kode", h.FindByKodeLahan)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *LahanHandler) FindAll(c *fiber.Ctx) error {
	lands, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all lands", lands)
}

func (h *LahanHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	l, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if l == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Land not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get land", l)
}

func (h *LahanHandler) Create(c *fiber.Ctx) error {
	var l domain.Lahan
	if err := c.BodyParser(&l); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &l); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create land", l)
}

func (h *LahanHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var l domain.Lahan
	if err := c.BodyParser(&l); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	l.IDLahan = id
	if err := h.usecase.Update(c.Context(), &l); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update land", l)
}

func (h *LahanHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete land", nil)
}

func (h *LahanHandler) FindByKodeLahan(c *fiber.Ctx) error {
	kode := c.Params("kode")
	if kode == "" {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid code")
	}
	l, err := h.usecase.FindByKodeLahan(c.Context(), kode)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if l == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Land not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get land by code", l)
}

