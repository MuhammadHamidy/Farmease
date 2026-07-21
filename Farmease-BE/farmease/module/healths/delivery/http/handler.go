package http

import (
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
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
