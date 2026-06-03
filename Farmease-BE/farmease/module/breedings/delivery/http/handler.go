package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type BreedingHandler struct {
	useCase domain.UseCase
}

func NewBreedingHandler(useCase domain.UseCase) *BreedingHandler {
	return &BreedingHandler{useCase: useCase}
}

func (h *BreedingHandler) RegisterRoutes(app *fiber.App) {
	matings := app.Group("/api/matings")
	h.registerGroup(matings)

	perkawinan := app.Group("/api/perkawinan")
	h.registerGroup(perkawinan)
}

func (h *BreedingHandler) registerGroup(group fiber.Router) {
	group.Post("/check-inbreeding", h.CheckInbreeding)
	group.Post("/cek-inbreeding", h.CheckInbreeding)
	group.Get("/", h.GetMatingList)
	group.Post("/", h.RecordMating)
	group.Get("/:id", h.GetMatingDetail)
	group.Patch("/:id/status", h.UpdateMatingStatus)
}


// CheckInbreeding godoc
// @Summary      Check inbreeding risk
// @Description  Calculate CoI and common ancestors between a pair of sheep
// @Tags         breeding
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.InbreedingCheckRequest  true  "Pair details"
// @Success      200     {object}  domain.InbreedingCheckResponse
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/matings/check-inbreeding [post]
func (h *BreedingHandler) CheckInbreeding(c *fiber.Ctx) error {
	var req domain.InbreedingCheckRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	res, err := h.useCase.CheckInbreeding(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// GetMatingList godoc
// @Summary      Get list of matings
// @Description  Retrieve history of sheep matings with filters
// @Tags         breeding
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        status           query     string  false  "Filter by status"
// @Param        inbreeding_flag  query     bool    false  "Filter by inbreeding flag"
// @Success      200              {array}   domain.Mating
// @Failure      500              {object}  responses.Response[any]
// @Router       /api/matings [get]
func (h *BreedingHandler) GetMatingList(c *fiber.Ctx) error {
	status := c.Query("status")
	var inbreedingFlag *bool
	if fs := c.Query("inbreeding_flag"); fs != "" {
		val := fs == "true"
		inbreedingFlag = &val
	}

	res, err := h.useCase.GetMatingList(c.Context(), status, inbreedingFlag)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// RecordMating godoc
// @Summary      Record a mating
// @Description  Register a new mating event between two sheep
// @Tags         breeding
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Mating  true  "Mating details"
// @Success      201     {object}  domain.Mating
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/matings [post]
func (h *BreedingHandler) RecordMating(c *fiber.Ctx) error {
	var p domain.Mating
	if err := c.BodyParser(&p); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.RecordMating(c.Context(), &p)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(p)
}

// GetMatingDetail godoc
// @Summary      Get mating details
// @Description  Retrieve specific mating event details by ID
// @Tags         breeding
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Mating ID"
// @Success      200  {object}  domain.Mating
// @Failure      404  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/matings/{id} [get]
func (h *BreedingHandler) GetMatingDetail(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetMatingDetail(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Mating record not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// UpdateMatingStatus godoc
// @Summary      Update mating status
// @Description  Update the status of a mating event
// @Tags         breeding
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int     true  "Mating ID"
// @Param        request body      object  true  "Status details"
// @Success      200     {object}  object
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/matings/{id}/status [patch]
func (h *BreedingHandler) UpdateMatingStatus(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req struct {
		Status string `json:"status"`
		Notes  string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.UpdateMatingStatus(c.Context(), id, req.Status, req.Notes)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}
