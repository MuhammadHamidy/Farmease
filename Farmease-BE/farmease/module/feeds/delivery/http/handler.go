package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type FeedHandler struct {
	useCase domain.UseCase
}

func NewFeedHandler(useCase domain.UseCase) *FeedHandler {
	return &FeedHandler{useCase: useCase}
}

func (h *FeedHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	// Global master feed endpoints
	feeds := api.Group("/feeds")
	h.registerFeedsGroup(feeds)

	pakanMaster := api.Group("/pakan/master")
	h.registerFeedsGroup(pakanMaster)

	// Global feeding history list
	api.Get("/feedings", h.GetFeedingList)
	api.Get("/pemberian-pakan", h.GetFeedingList)

	// Sheep-specific feeding recommendations and logs
	sheep := api.Group("/sheep/:id")
	h.registerSheepGroup(sheep)

	domba := api.Group("/domba/:id")
	h.registerSheepGroup(domba)

	// Extra Indonesian-styled pakan endpoints
	api.Get("/pakan/rekomendasi/:id", h.GetFeedRecommendation)
	api.Get("/pakan/rekomendasi/kandang/:id", h.GetFeedRecommendationByCage)
}

func (h *FeedHandler) registerFeedsGroup(group fiber.Router) {
	group.Get("/", h.GetMasterFeedList)
	group.Post("/", h.AddMasterFeed)
	group.Patch("/:id/stock", h.UpdateFeedStock)
	group.Patch("/:id/stok", h.UpdateFeedStock) // Postman uses stok
}

func (h *FeedHandler) registerSheepGroup(group fiber.Router) {
	group.Get("/feed-recommendation", h.GetFeedRecommendation)
	group.Get("/feedings", h.GetFeedingHistory)
	group.Post("/feedings", h.RecordFeeding)
	group.Get("/pemberian-pakan", h.GetFeedingHistory)
	group.Post("/pemberian-pakan", h.RecordFeeding)
}


// GetMasterFeedList godoc
// @Summary      Get list of master feeds
// @Description  Retrieve all types of feed available in stock
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array}   domain.Feed
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/feeds [get]
func (h *FeedHandler) GetMasterFeedList(c *fiber.Ctx) error {
	res, err := h.useCase.GetMasterFeedList(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// AddMasterFeed godoc
// @Summary      Add new feed type
// @Description  Register a new type of feed in master data
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Feed  true  "Feed details"
// @Success      201     {object}  domain.Feed
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/feeds [post]
func (h *FeedHandler) AddMasterFeed(c *fiber.Ctx) error {
	var req struct {
		FeedName       string  `json:"feed_name"`
		Unit           string  `json:"unit"`
		AvailableStock float64 `json:"available_stock"`
		Stock          float64 `json:"stock"` // fallback for FE
		Category       string  `json:"category"`
		FeedType       string  `json:"feed_type"` // fallback for FE
		PricePerUnit   float64 `json:"price_per_unit"`
		Notes          string  `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	feedData := domain.Feed{
		FeedName:     req.FeedName,
		Unit:         req.Unit,
		PricePerUnit: req.PricePerUnit,
		Notes:        req.Notes,
	}

	if req.AvailableStock != 0 {
		feedData.AvailableStock = req.AvailableStock
	} else {
		feedData.AvailableStock = req.Stock
	}

	if req.Category != "" {
		feedData.Category = req.Category
	} else {
		feedData.Category = req.FeedType
	}

	err := h.useCase.AddMasterFeed(c.Context(), &feedData)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(feedData)
}

// UpdateFeedStock godoc
// @Summary      Update feed stock
// @Description  Add or subtract feed stock
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      int     true  "Feed ID"
// @Param        request body      object  true  "Stock update details"
// @Success      200     {object}  object
// @Failure      400     {object}  responses.Response[any]
// @Failure      422     {object}  responses.Response[any]
// @Router       /api/feeds/{id}/stock [patch]
func (h *FeedHandler) UpdateFeedStock(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var req struct {
		Amount float64 `json:"amount"`
		Type   string  `json:"type"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	err := h.useCase.UpdateFeedStock(c.Context(), id, req.Amount, req.Type)
	if err != nil {
		return c.Status(http.StatusUnprocessableEntity).JSON(responses.Fail("UNPROCESSABLE_ENTITY", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

// GetFeedRecommendation godoc
// @Summary      Get feed recommendation
// @Description  Calculate recommended feed for a sheep based on its weight
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Sheep ID"
// @Success      200  {object}  domain.FeedRecommendation
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/sheep/{id}/feed-recommendation [get]
func (h *FeedHandler) GetFeedRecommendation(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetFeedRecommendation(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// GetFeedingHistory godoc
// @Summary      Get feeding history
// @Description  Retrieve feeding history for a specific sheep
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Sheep ID"
// @Success      200  {array}   domain.Feeding
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/sheep/{id}/feedings [get]
func (h *FeedHandler) GetFeedingHistory(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetFeedingHistory(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

// RecordFeeding godoc
// @Summary      Record feeding
// @Description  Record that a sheep has been fed
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id        path      int             true  "Sheep ID"
// @Param        request   body      domain.Feeding  true  "Feeding details"
// @Success      201       {object}  domain.Feeding
// @Failure      400       {object}  responses.Response[any]
// @Failure      422       {object}  responses.Response[any]
// @Router       /api/sheep/{id}/feedings [post]
func (h *FeedHandler) RecordFeeding(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var feedingData domain.Feeding
	if err := c.BodyParser(&feedingData); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	feedingData.IDSheep = id
	err := h.useCase.RecordFeeding(c.Context(), &feedingData)
	if err != nil {
		return c.Status(http.StatusUnprocessableEntity).JSON(responses.Fail("UNPROCESSABLE_ENTITY", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(feedingData)
}

// GetFeedingList godoc
// @Summary      Get list of all feedings
// @Description  Retrieve all feeding records across the system with filtering and pagination
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id_sheep       query     int     false  "Filter by sheep ID"
// @Param        page           query     int     false  "Page number"
// @Param        per_page       query     int     false  "Items per page"
// @Success      200            {array}   domain.Feeding
// @Failure      500            {object}  responses.Response[any]
// @Router       /api/feedings [get]
func (h *FeedHandler) GetFeedingList(c *fiber.Ctx) error {
	filter := domain.FeedingFilter{
		IDSheep: c.QueryInt("id_sheep"),
		Page:    c.QueryInt("page", 1),
		PerPage: c.QueryInt("per_page", 20),
	}

	res, _, err := h.useCase.GetFeedingList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}

// GetFeedRecommendationByCage godoc
// @Summary      Get feed recommendation per cage
// @Description  Retrieve total feed recommendation for all sheep in a specific cage
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      200  {object}  domain.CageFeedRecommendation
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/pakan/rekomendasi/kandang/{id} [get]
func (h *FeedHandler) GetFeedRecommendationByCage(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	res, err := h.useCase.GetFeedRecommendationByCage(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

