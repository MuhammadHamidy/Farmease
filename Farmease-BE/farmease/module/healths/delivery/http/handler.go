package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/healths/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type HealthHandler struct {
	useCase domain.UseCase
}

func NewHealthHandler(useCase domain.UseCase) *HealthHandler {
	return &HealthHandler{useCase: useCase}
}

func (h *HealthHandler) RegisterRoutes(app *fiber.App) {
	group := app.Group("/api")
	
	// Global list endpoint
	group.Get("/healths", h.GetHealthList)
	group.Get("/kesehatan", h.GetHealthList)

	// Sheep-specific sub-routes
	sheepHealth := group.Group("/sheep/:id/health")
	h.registerSheepGroup(sheepHealth)

	dombaKesehatan := group.Group("/domba/:id/kesehatan")
	h.registerSheepGroup(dombaKesehatan)

	// Individual record action
	healthRecord := group.Group("/healths/:id")
	h.registerRecordGroup(healthRecord)

	indivKesehatan := group.Group("/kesehatan/:id")
	h.registerRecordGroup(indivKesehatan)
}

func (h *HealthHandler) registerSheepGroup(group fiber.Router) {
	group.Get("/", h.GetHealthHistory)
	group.Post("/", h.RecordHealth)
}

func (h *HealthHandler) registerRecordGroup(group fiber.Router) {
	group.Put("/", h.UpdateHealth)
}


// GetHealthList godoc
// @Summary      Get list of all health records
// @Description  Retrieve all health records across the system with filtering and pagination
// @Tags         health
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id_sheep       query     int     false  "Filter by sheep ID"
// @Param        page           query     int     false  "Page number"
// @Param        per_page       query     int     false  "Items per page"
// @Success      200            {array}   domain.Health
// @Failure      500            {object}  responses.Response[any]
// @Router       /api/healths [get]
func (h *HealthHandler) GetHealthList(c *fiber.Ctx) error {
	filter := domain.HealthFilter{
		IDSheep: c.QueryInt("id_sheep"),
		Page:    c.QueryInt("page", 1),
		PerPage: c.QueryInt("per_page", 20),
	}

	res, _, err := h.useCase.GetHealthList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// GetHealthHistory godoc
// @Summary      Get health history
// @Description  Retrieve health records for a specific sheep
// @Tags         health
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Sheep ID"
// @Success      200  {array}   domain.Health
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/sheep/{id}/health [get]
func (h *HealthHandler) GetHealthHistory(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetHealthHistory(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// RecordHealth godoc
// @Summary      Record health check
// @Description  Record a new health examination for a sheep
// @Tags         health
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int            true  "Sheep ID"
// @Param        request body      domain.Health  true  "Health check details"
// @Success      201     {object}  domain.Health
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/sheep/{id}/health [post]
func (h *HealthHandler) RecordHealth(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var k domain.Health
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	k.IDSheep = id
	err := h.useCase.RecordHealth(c.Context(), &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(k)
}

// UpdateHealth godoc
// @Summary      Update health record
// @Description  Update details of a health examination
// @Tags         health
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int            true  "Record ID"
// @Param        request body      domain.Health  true  "Health check details"
// @Success      200     {object}  domain.Health
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/healths/{id} [put]
func (h *HealthHandler) UpdateHealth(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var k domain.Health
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	err := h.useCase.UpdateHealth(c.Context(), id, &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(k)
}
