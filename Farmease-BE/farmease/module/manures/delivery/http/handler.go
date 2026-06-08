package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/manures/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type ManureHandler struct {
	useCase domain.UseCase
}

func NewManureHandler(useCase domain.UseCase) *ManureHandler {
	return &ManureHandler{useCase: useCase}
}

func (h *ManureHandler) RegisterRoutes(app *fiber.App) {
	// Global list endpoint
	app.Get("/api/manures", h.GetManureList)
	app.Get("/api/kotoran", h.GetManureList)

	// Sheep-specific sub-routes
	sheepManures := app.Group("/api/sheep/:id/manures")
	h.registerSheepGroup(sheepManures)

	sheepManureSingular := app.Group("/api/sheep/:id/manure")
	h.registerSheepGroup(sheepManureSingular)

	dombaKotoran := app.Group("/api/domba/:id/kotoran")
	h.registerSheepGroup(dombaKotoran)
}

func (h *ManureHandler) registerSheepGroup(group fiber.Router) {
	group.Get("/", h.GetManureHistory)
	group.Post("/", h.RecordManure)
}


// GetManureList godoc
// @Summary      Get list of all manure records
// @Description  Retrieve all manure records across the system with filtering and pagination
// @Tags         manures
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id_sheep       query     int     false  "Filter by sheep ID"
// @Param        page           query     int     false  "Page number"
// @Param        per_page       query     int     false  "Items per page"
// @Success      200            {array}   domain.Manure
// @Failure      500            {object}  responses.Response[any]
// @Router       /api/manures [get]
func (h *ManureHandler) GetManureList(c *fiber.Ctx) error {
	filter := domain.ManureFilter{
		IDSheep: c.QueryInt("id_sheep"),
		Page:    c.QueryInt("page", 1),
		PerPage: c.QueryInt("per_page", 20),
	}

	res, _, err := h.useCase.GetManureList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// GetManureHistory godoc
// @Summary      Get manure history
// @Description  Retrieve manure collection records for a specific sheep
// @Tags         manures
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Sheep ID"
// @Success      200  {array}   domain.Manure
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/sheep/{id}/manures [get]
func (h *ManureHandler) GetManureHistory(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetManureHistory(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// RecordManure godoc
// @Summary      Record manure activity
// @Description  Record a new manure collection event for a sheep
// @Tags         manures
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int            true  "Sheep ID"
// @Param        request body      domain.Manure  true  "Manure details"
// @Success      201     {object}  domain.Manure
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/sheep/{id}/manures [post]
func (h *ManureHandler) RecordManure(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var m domain.Manure
	if err := c.BodyParser(&m); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	m.IDSheep = id
	err := h.useCase.RecordManure(c.Context(), &m)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(m)
}
