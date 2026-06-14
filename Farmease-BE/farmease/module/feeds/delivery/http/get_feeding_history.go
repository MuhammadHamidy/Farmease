package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetFeedingHistory godoc
// @Summary      Get feeding history
// @Description  Retrieve feeding history for a specific sheep
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Sheep ID"
// @Success      200  {array}   domain.Feeding
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/sheep/{id}/feedings [get]
func (h *FeedHandler) GetFeedingHistory(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetFeedingHistory(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
