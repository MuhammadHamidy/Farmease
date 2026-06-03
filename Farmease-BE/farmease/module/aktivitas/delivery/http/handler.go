package http

import (
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/aktivitas/domain"
	"github.com/farmease/farmease-be/libraries/apiresponses"
	"github.com/gofiber/fiber/v2"
)

type AktivitasHandler struct {
	usecase domain.AktivitasUsecase
}

func NewAktivitasHandler(usecase domain.AktivitasUsecase) *AktivitasHandler {
	return &AktivitasHandler{usecase: usecase}
}

func (h *AktivitasHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/aktivitas")
	api.Get("/", h.FindAll)
	api.Get("/:id", h.FindByID)
	api.Post("/", h.Create)
	api.Put("/:id", h.Update)
	api.Delete("/:id", h.Delete)
}

// FindAll godoc
// @Summary      Get list of all activities
// @Description  Retrieve all agricultural activities
// @Tags         aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200      {array}   domain.Aktivitas
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/aktivitas [get]
func (h *AktivitasHandler) FindAll(c *fiber.Ctx) error {
	list, err := h.usecase.FindAll(c.Context())
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get all activities", list)
}

// FindByID godoc
// @Summary      Get details of an activity
// @Description  Retrieve specific activity details by ID
// @Tags         aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Aktivitas ID"
// @Success      200      {object}  domain.Aktivitas
// @Failure      400      {object}  map[string]interface{}
// @Failure      404      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/aktivitas/{id} [get]
func (h *AktivitasHandler) FindByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	a, err := h.usecase.FindByID(c.Context(), id)
	if err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	if a == nil {
		return apiresponses.Fail(c, fiber.StatusNotFound, "Activity not found")
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success get activity", a)
}

// Create godoc
// @Summary      Create a new activity
// @Description  Record a new agricultural activity
// @Tags         aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request  body      domain.Aktivitas  true  "Activity details"
// @Success      201      {object}  domain.Aktivitas
// @Failure      400      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/aktivitas [post]
func (h *AktivitasHandler) Create(c *fiber.Ctx) error {
	var a domain.Aktivitas
	if err := c.BodyParser(&a); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	if err := h.usecase.Create(c.Context(), &a); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusCreated, "Success create activity", a)
}

// Update godoc
// @Summary      Update an activity
// @Description  Update details of an activity by ID
// @Tags         aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int               true  "Aktivitas ID"
// @Param        request  body      domain.Aktivitas  true  "Activity details"
// @Success      200      {object}  domain.Aktivitas
// @Failure      400      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/aktivitas/{id} [put]
func (h *AktivitasHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	var a domain.Aktivitas
	if err := c.BodyParser(&a); err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, err.Error())
	}
	a.IDAktivitas = id
	if err := h.usecase.Update(c.Context(), &a); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success update activity", a)
}

// Delete godoc
// @Summary      Delete an activity
// @Description  Delete an activity by ID
// @Tags         aktivitas
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Aktivitas ID"
// @Success      200      {object}  map[string]interface{}
// @Failure      400      {object}  map[string]interface{}
// @Failure      500      {object}  map[string]interface{}
// @Router       /api/v1/aktivitas/{id} [delete]
func (h *AktivitasHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return apiresponses.Fail(c, fiber.StatusBadRequest, "Invalid ID")
	}
	if err := h.usecase.Delete(c.Context(), id); err != nil {
		return apiresponses.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return apiresponses.Success(c, fiber.StatusOK, "Success delete activity", nil)
}

