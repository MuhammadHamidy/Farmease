package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

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
