package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type SheepHandler struct {
	useCase domain.UseCase
}

func NewSheepHandler(useCase domain.UseCase) *SheepHandler {
	return &SheepHandler{useCase: useCase}
}

func (h *SheepHandler) RegisterRoutes(app *fiber.App) {
	sheep := app.Group("/api/sheep")
	h.registerGroup(sheep)

	domba := app.Group("/api/domba")
	h.registerGroup(domba)
}

func (h *SheepHandler) registerGroup(group fiber.Router) {
	group.Get("/", h.GetSheepList)
	group.Post("/", h.RegisterSheep)
	group.Get("/:id", h.GetSheepDetail)
	group.Put("/:id", h.UpdateSheep)
	group.Patch("/:id/status", h.UpdateSheepStatus)
	group.Get("/:id/genealogy", h.GetSheepGenealogy)
	group.Get("/:id/silsilah", h.GetSheepGenealogy)
}


// GetSheepList godoc
// @Summary      Get list of all sheep
// @Description  Retrieve all sheep with filtering by cage, gender, and status
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id_cage       query     int     false  "Filter by cage ID"
// @Param        gender        query     string  false  "Filter by gender (Jantan/Betina)"
// @Param        status        query     string  false  "Filter by status"
// @Param        search        query     string  false  "Search by tag or nickname"
// @Param        page          query     int     false  "Page number"
// @Param        per_page      query     int     false  "Items per page"
// @Success      200           {array}   domain.Sheep
// @Failure      500           {object}  responses.Response[any]
// @Router       /api/sheep [get]
func (h *SheepHandler) GetSheepList(c *fiber.Ctx) error {
	filter := domain.SheepFilter{
		IDCage:    c.QueryInt("id_cage"),
		Gender:    c.Query("gender"),
		Status:    c.Query("status"),
		Search:    c.Query("search"),
		Page:      c.QueryInt("page", 1),
		PerPage:   c.QueryInt("per_page", 20),
	}

	res, _, err := h.useCase.GetSheepList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// RegisterSheep godoc
// @Summary      Register a new sheep
// @Description  Create a new sheep entry with initial details
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Sheep  true  "Sheep details"
// @Success      201     {object}  domain.Sheep
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/sheep [post]
func (h *SheepHandler) RegisterSheep(c *fiber.Ctx) error {
	var s domain.Sheep
	if err := c.BodyParser(&s); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.RegisterSheep(c.Context(), &s)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(s)
}

// GetSheepDetail godoc
// @Summary      Get details of a sheep
// @Description  Retrieve specific sheep details by ID
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Sheep ID"
// @Success      200  {object}  domain.Sheep
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/sheep/{id} [get]
func (h *SheepHandler) GetSheepDetail(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetSheepDetail(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Sheep not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// UpdateSheep godoc
// @Summary      Update sheep details
// @Description  Update details of an existing sheep
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int  true  "Sheep ID"
// @Param        request  body      domain.Sheep  true  "Sheep details"
// @Success      200      {object}  domain.Sheep
// @Failure      400      {object}  responses.Response[any]
// @Failure      500      {object}  responses.Response[any]
// @Router       /api/sheep/{id} [put]
func (h *SheepHandler) UpdateSheep(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var s domain.Sheep
	if err := c.BodyParser(&s); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.UpdateSheep(c.Context(), id, &s)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(s)
}

// UpdateSheepStatus godoc
// @Summary      Update sheep status
// @Description  Update the status of a sheep
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int  true  "Sheep ID"
// @Param        request  body      object  true  "Status details"
// @Success      200      {object}  object
// @Failure      400      {object}  responses.Response[any]
// @Failure      500      {object}  responses.Response[any]
// @Router       /api/sheep/{id}/status [patch]
func (h *SheepHandler) UpdateSheepStatus(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req struct {
		Status  string `json:"status"`
		Notes   string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.UpdateSheepStatus(c.Context(), id, req.Status, req.Notes)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"id_sheep":   id,
		"status":     req.Status,
		"updated_at": "now",
	})
}

// GetSheepGenealogy godoc
// @Summary      Get sheep genealogy
// @Description  Retrieve family tree of a sheep up to specified generations
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id        path      int  true   "Sheep ID"
// @Param        generation query     int  false  "Number of generations to traverse"
// @Success      200       {object}  domain.Genealogy
// @Failure      500       {object}  responses.Response[any]
// @Router       /api/sheep/{id}/genealogy [get]
func (h *SheepHandler) GetSheepGenealogy(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	generation := c.QueryInt("generation", 3)

	res, err := h.useCase.GetSheepGenealogy(c.Context(), id, generation)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
