package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetFeedRecommendation godoc
// @Summary      Get feed recommendation
// @Description  Calculate recommended feed for a sheep based on its weight
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Sheep ID"
// @Success      200  {object}  domain.FeedRecommendation
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/sheep/{id}/feed-recommendation [get]
func (h *FeedHandler) GetFeedRecommendation(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetFeedRecommendation(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
