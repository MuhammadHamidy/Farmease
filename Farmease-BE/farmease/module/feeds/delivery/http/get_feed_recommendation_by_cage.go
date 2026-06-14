package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetFeedRecommendationByCage godoc
// @Summary      Get feed recommendation per cage
// @Description  Retrieve total feed recommendation for all sheep in a specific cage
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Cage ID"
// @Success      200  {object}  domain.CageFeedRecommendation
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/pakan/rekomendasi/kandang/{id} [get]
func (h *FeedHandler) GetFeedRecommendationByCage(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetFeedRecommendationByCage(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
