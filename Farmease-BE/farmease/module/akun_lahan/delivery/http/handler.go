package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/akun_lahan/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type AkunLahanHandler struct {
	usecase domain.AkunLahanUsecase
}

func NewAkunLahanHandler(usecase domain.AkunLahanUsecase) *AkunLahanHandler {
	return &AkunLahanHandler{usecase: usecase}
}

func (h *AkunLahanHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/akun-lahan")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *AkunLahanHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all account-land assignments", list)
}

func (h *AkunLahanHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	al, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if al == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Assignment not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get account-land assignment", al)
}

func (h *AkunLahanHandler) Create(c *fiber.Ctx) error {
	var al domain.AkunLahan
	if err := c.BodyParser(&al); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &al); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create account-land assignment", al)
}

func (h *AkunLahanHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var al domain.AkunLahan
	if err := c.BodyParser(&al); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	al.IDAkunLahan = id
	if err := h.usecase.Update(c.Context(), &al); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update account-land assignment", al)
}

func (h *AkunLahanHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete account-land assignment", nil)
}

