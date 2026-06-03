package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/status_aktivitas/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type StatusAktivitasHandler struct {
	usecase domain.StatusAktivitasUsecase
}

func NewStatusAktivitasHandler(usecase domain.StatusAktivitasUsecase) *StatusAktivitasHandler {
	return &StatusAktivitasHandler{usecase: usecase}
}

func (h *StatusAktivitasHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/status-aktivitas")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

// FindAll godoc
// @Summary      Get list of all activity statuses
// @Description  Retrieve all activity statuses with activity details
// @Tags         status_aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200      {array}   domain.StatusAktivitas
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/status-aktivitas [get]
func (h *StatusAktivitasHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all activity statuses", list)
}

// FindByID godoc
// @Summary      Get details of an activity status
// @Description  Retrieve specific activity status details by ID
// @Tags         status_aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Status Aktivitas ID"
// @Success      200      {object}  domain.StatusAktivitas
// @Failure      400      {object}  map[string]interface{}
// @Failure      404      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/status-aktivitas/{id} [get]
func (h *StatusAktivitasHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	sa, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if sa == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Activity status not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get activity status", sa)
}

// Create godoc
// @Summary      Create a new activity status
// @Description  Record a new activity status and trigger a notification
// @Tags         status_aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request  body      domain.StatusAktivitas  true  "Activity status details"
// @Success      201      {object}  domain.StatusAktivitas
// @Failure      400      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/status-aktivitas [post]
func (h *StatusAktivitasHandler) Create(c *fiber.Ctx) error {
	var sa domain.StatusAktivitas
	if err := c.BodyParser(&sa); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &sa); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create activity status", sa)
}

// Update godoc
// @Summary      Update an activity status
// @Description  Update details of an activity status by ID and trigger a notification
// @Tags         status_aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int                     true  "Status Aktivitas ID"
// @Param        request  body      domain.StatusAktivitas  true  "Activity status details"
// @Success      200      {object}  domain.StatusAktivitas
// @Failure      400      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/status-aktivitas/{id} [put]
func (h *StatusAktivitasHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var sa domain.StatusAktivitas
	if err := c.BodyParser(&sa); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	sa.IDStatusAktivitas = id
	if err := h.usecase.Update(c.Context(), &sa); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update activity status", sa)
}

// Delete godoc
// @Summary      Delete an activity status
// @Description  Delete an activity status by ID
// @Tags         status_aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Status Aktivitas ID"
// @Success      200      {object}  map[string]interface{}
// @Failure      400      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/status-aktivitas/{id} [delete]
func (h *StatusAktivitasHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete activity status", nil)
}

