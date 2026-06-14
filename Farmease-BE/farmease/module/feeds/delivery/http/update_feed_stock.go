package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// UpdateFeedStock godoc
// @Summary      Update feed stock
// @Description  Add or subtract feed stock
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      string  true  "Feed ID"
// @Param        request body      object  true  "Stock update details"
// @Success      200     {object}  object
// @Failure      400     {object}  responses.Response[any]
// @Failure      422     {object}  responses.Response[any]
// @Router       /api/feeds/{id}/stock [patch]
func (h *FeedHandler) UpdateFeedStock(c *fiber.Ctx) error {
	id := c.Params("id")
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
