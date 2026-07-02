package http

import (
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
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

	// Add breeding prefix routes to match prompt exactly
	breeding := api.Group("/breeding")
	breedingPregnancies := breeding.Group("/pregnancies")
	h.registerPregnanciesGroup(breedingPregnancies)
	breedingBirths := breeding.Group("/births")
	h.registerBirthsGroup(breedingBirths)
}

func (h *PregnancyHandler) registerPregnanciesGroup(group fiber.Router) {
	group.Post("/", h.RecordPregnancy)
	group.Get("/", h.GetPregnancyList)
	group.Post("/check", h.CheckPregnancy)
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

// CheckPregnancy godoc
// @Summary      Submit pregnancy check result
// @Description  Submit the check result for a pregnancy (Kontrol Kebuntingan)
// @Tags         pregnancies
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.PregnancyCheckRequest  true  "Check details"
// @Success      200     {object}  object
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/pregnancies/check [post]
