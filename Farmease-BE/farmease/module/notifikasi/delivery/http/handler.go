package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/notifikasi/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type NotifikasiHandler struct {
	usecase domain.NotifikasiUsecase
}

func NewNotifikasiHandler(usecase domain.NotifikasiUsecase) *NotifikasiHandler {
	return &NotifikasiHandler{usecase: usecase}
}

func (h *NotifikasiHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/notifikasi")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

func (h *NotifikasiHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all notifications", list)
}

func (h *NotifikasiHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	n, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if n == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Notification not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get notification", n)
}

func (h *NotifikasiHandler) Create(c *fiber.Ctx) error {
	var n domain.Notifikasi
	if err := c.BodyParser(&n); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &n); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create notification", n)
}

func (h *NotifikasiHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var n domain.Notifikasi
	if err := c.BodyParser(&n); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	n.IDNotifikasi = id
	if err := h.usecase.Update(c.Context(), &n); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update notification", n)
}

func (h *NotifikasiHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete notification", nil)
}

