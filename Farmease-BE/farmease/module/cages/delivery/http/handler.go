package http

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/cages/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type CageHandler struct {
	useCase domain.UseCase
}

func NewCageHandler(useCase domain.UseCase) *CageHandler {
	return &CageHandler{useCase: useCase}
}

func (h *CageHandler) RegisterRoutes(app *fiber.App) {
	cages := app.Group("/api/cages")
	h.registerGroup(cages)

	kandang := app.Group("/api/kandang")
	h.registerGroup(kandang)
}

func (h *CageHandler) registerGroup(group fiber.Router) {
	group.Get("/", h.GetCageList)
	group.Post("/", h.CreateCage)
	group.Get("/verify/:code", h.VerifyCage)
	group.Get("/:id/stats", h.GetCageStats)
	group.Get("/:id/weight-stats", h.GetCageWeightStats)
	group.Get("/:id", h.GetCageDetail)
	group.Put("/:id", h.UpdateCage)
	group.Delete("/:id", h.DeleteCage)
}


// GetCageList godoc
// @Summary      Get list of all cages
// @Description  Retrieve all cages with filtering by cage type
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        cage_type      query     string  false  "Filter by cage type"
// @Param        page           query     int     false  "Page number"
// @Param        per_page       query     int     false  "Items per page"
// @Success      200            {array}   domain.Cage
// @Failure      500            {object}  responses.Response[any]
// @Router       /api/cages [get]
// func (h *CageHandler) GetCageList(c *fiber.Ctx) error {
func (h *CageHandler) GetCageList(c *fiber.Ctx) error {
	filter := domain.CageFilter{
		CageType: c.Query("cage_type"),
		Page:     c.QueryInt("page", 1),
		PerPage:  c.QueryInt("per_page", 20),
	}

	res, _, err := h.useCase.GetCageList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// CreateCage godoc
// @Summary      Create a new cage
// @Description  Create a new sheep cage with capacity and code
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Cage  true  "Cage details"
// @Success      201     {object}  domain.Cage
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/cages [post]
func (h *CageHandler) CreateCage(c *fiber.Ctx) error {
	var k domain.Cage
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.CreateCage(c.Context(), &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(k)
}

// GetCageDetail godoc
// @Summary      Get details of a cage
// @Description  Retrieve specific cage details by ID
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      200  {object}  domain.Cage
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/{id} [get]
func (h *CageHandler) GetCageDetail(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetCageDetail(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Cage not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// UpdateCage godoc
// @Summary      Update a cage
// @Description  Update details of an existing cage
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int             true  "Cage ID"
// @Param        request  body      domain.Cage  true  "Cage details"
// @Success      200      {object}  domain.Cage
// @Failure      400      {object}  responses.Response[any]
// @Failure      500      {object}  responses.Response[any]
// @Router       /api/cages/{id} [put]
func (h *CageHandler) UpdateCage(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var k domain.Cage
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.UpdateCage(c.Context(), id, &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(k)
}

// DeleteCage godoc
// @Summary      Delete a cage
// @Description  Delete a cage by ID (fails if cage is not empty)
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      204  "No Content"
// @Failure      409  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/cages/{id} [delete]
func (h *CageHandler) DeleteCage(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	err := h.useCase.DeleteCage(c.Context(), id)
	if err != nil {
		if err.Error() == "cage cannot be deleted because it still contains sheep" {
			return c.Status(http.StatusConflict).JSON(responses.Fail("CONFLICT", err.Error()))
		}
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusNoContent).Send(nil)
}

// VerifyCage godoc
// @Summary      Verify cage by code
// @Description  Check if a cage code exists and get its details
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        code path      string  true  "Cage Code"
// @Success      200  {object}  domain.Cage
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/verify/{code} [get]
func (h *CageHandler) VerifyCage(c *fiber.Ctx) error {
	code := c.Params("code")
	res, err := h.useCase.VerifyCage(c.Context(), code)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// GetCageStats godoc
// @Summary      Get stats of a cage
// @Description  Retrieve sheep statistics for a specific cage
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      200  {object}  domain.CageStats
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/{id}/stats [get]
func (h *CageHandler) GetCageStats(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetCageStats(c.Context(), id)
	if err != nil {
		fmt.Printf("ERROR in GetCageStats: %v\n", err)
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// GetCageWeightStats godoc
// @Summary      Get weight stats of a cage
// @Description  Retrieve monthly aggregated weight statistics for a specific cage
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      200  {object}  domain.CageWeightStats
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/{id}/weight-stats [get]
func (h *CageHandler) GetCageWeightStats(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetCageWeightStats(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
