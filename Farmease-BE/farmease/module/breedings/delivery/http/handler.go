package http

import (
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
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

// GetMatingDetail godoc
// @Summary      Get mating details
// @Description  Retrieve specific mating event details by ID
// @Tags         breeding
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Mating ID"
// @Success      200  {object}  domain.Mating
// @Failure      404  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/matings/{id} [get]

// UpdateMatingStatus godoc
// @Summary      Update mating status
// @Description  Update the status of a mating event
// @Tags         breeding
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      string  true  "Mating ID"
// @Param        request body      object  true  "Status details"
// @Success      200     {object}  object
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/matings/{id}/status [patch]
