package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	responses "github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type PregnancyHandler struct {
	useCase domain.UseCase
}

func NewPregnancyHandler(useCase domain.UseCase) *PregnancyHandler {
	return &PregnancyHandler{useCase: useCase}
}

func (h *PregnancyHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	pregnancies := api.Group("/pregnancies")
	h.registerPregnanciesGroup(pregnancies)

	kehamilan := api.Group("/kehamilan")
	h.registerPregnanciesGroup(kehamilan)

	births := api.Group("/births")
	h.registerBirthsGroup(births)

	kelahiran := api.Group("/kelahiran")
	h.registerBirthsGroup(kelahiran)
}

func (h *PregnancyHandler) registerPregnanciesGroup(group fiber.Router) {
	group.Post("/", h.RecordPregnancy)
	group.Get("/", h.GetPregnancyList)
	group.Patch("/:id/status", h.UpdatePregnancyStatus)
}

func (h *PregnancyHandler) registerBirthsGroup(group fiber.Router) {
	group.Post("/", h.RecordBirth)
	group.Get("/", h.GetBirthHistory)
}


// RecordPregnancy godoc
// @Summary      Record pregnancy
// @Description  Record a new pregnancy for a female sheep
// @Tags         pregnancies
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Pregnancy  true  "Pregnancy details"
// @Success      201     {object}  domain.Pregnancy
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/pregnancies [post]
func (h *PregnancyHandler) RecordPregnancy(c *fiber.Ctx) error {
	var k domain.Pregnancy
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.RecordPregnancy(c.Context(), &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(k)
}

// GetPregnancyList godoc
// @Summary      Get list of pregnancies
// @Description  Retrieve all pregnancies with optional status filter
// @Tags         pregnancies
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        pregnancy_status  query     string  false  "Filter by status (dikandung/lahir/gugur)"
// @Success      200               {array}   domain.Pregnancy
// @Failure      500               {object}  responses.Response[any]
// @Router       /api/pregnancies [get]
func (h *PregnancyHandler) GetPregnancyList(c *fiber.Ctx) error {
	status := c.Query("pregnancy_status")
	res, err := h.useCase.GetPregnancyList(c.Context(), status)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// UpdatePregnancyStatus godoc
// @Summary      Update pregnancy status
// @Description  Update the status of a pregnancy (e.g. to lahir or gugur)
// @Tags         pregnancies
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int     true  "Pregnancy ID"
// @Param        request body      object  true  "Status details"
// @Success      200     {object}  object
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/pregnancies/{id}/status [patch]
func (h *PregnancyHandler) UpdatePregnancyStatus(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req struct {
		PregnancyStatus string `json:"pregnancy_status"`
		Status          string `json:"status"` // fallback for FE
		Notes           string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	status := req.PregnancyStatus
	if status == "" {
		status = req.Status
	}

	err := h.useCase.UpdatePregnancyStatus(c.Context(), id, status, req.Notes)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

// RecordBirth godoc
// @Summary      Record birth
// @Description  Record a birth event and automatically register offspring
// @Tags         pregnancies
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Birth  true  "Birth details"
// @Success      201     {object}  domain.Birth
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/births [post]
func (h *PregnancyHandler) RecordBirth(c *fiber.Ctx) error {
	var k domain.Birth
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.RecordBirth(c.Context(), &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(k)
}

// GetBirthHistory godoc
// @Summary      Get birth history
// @Description  Retrieve all birth records
// @Tags         pregnancies
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array}   domain.Birth
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/births [get]
func (h *PregnancyHandler) GetBirthHistory(c *fiber.Ctx) error {
	res, err := h.useCase.GetBirthHistory(c.Context(), nil, nil)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
