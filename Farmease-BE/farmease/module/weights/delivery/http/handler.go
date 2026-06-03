package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/weights/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type WeightHandler struct {
	useCase domain.UseCase
}

func NewWeightHandler(useCase domain.UseCase) *WeightHandler {
	return &WeightHandler{useCase: useCase}
}

func (h *WeightHandler) RegisterRoutes(app *fiber.App) {
	// Global list endpoint
	app.Get("/api/weights", h.GetWeightList)
	app.Get("/api/berat-badan", h.GetWeightList)

	// Sheep-specific sub-routes
	sheepWeight := app.Group("/api/sheep/:id/weight")
	h.registerSheepGroup(sheepWeight)

	dombaBerat := app.Group("/api/domba/:id/berat-badan")
	h.registerSheepGroup(dombaBerat)
}

func (h *WeightHandler) registerSheepGroup(group fiber.Router) {
	group.Get("/", h.GetWeightHistory)
	group.Post("/", h.RecordWeight)
}


// GetWeightList godoc
// @Summary      Get list of all weight logs
// @Description  Retrieve all weight logs across the system with filtering and pagination
// @Tags         weights
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id_sheep       query     int     false  "Filter by sheep ID"
// @Param        page           query     int     false  "Page number"
// @Param        per_page       query     int     false  "Items per page"
// @Success      200            {array}   domain.Weight
// @Failure      500            {object}  responses.Response[any]
// @Router       /api/weights [get]
func (h *WeightHandler) GetWeightList(c *fiber.Ctx) error {
	filter := domain.WeightFilter{
		IDSheep: c.QueryInt("id_sheep"),
		Page:    c.QueryInt("page", 1),
		PerPage: c.QueryInt("per_page", 20),
	}

	res, _, err := h.useCase.GetWeightList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// GetWeightHistory godoc
// @Summary      Get sheep weight history
// @Description  Retrieve all weight records for a specific sheep
// @Tags         weights
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Sheep ID"
// @Success      200  {array}   domain.Weight
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/sheep/{id}/weight [get]
func (h *WeightHandler) GetWeightHistory(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetWeightHistory(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// RecordWeight godoc
// @Summary      Record new weight
// @Description  Create a new weight record for a specific sheep
// @Tags         weights
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int            true  "Sheep ID"
// @Param        request body      domain.Weight  true  "Weight details"
// @Success      201     {object}  domain.Weight
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/sheep/{id}/weight [post]
func (h *WeightHandler) RecordWeight(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var w domain.Weight
	if err := c.BodyParser(&w); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	w.IDSheep = id
	err := h.useCase.RecordWeight(c.Context(), &w)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(w)
}
