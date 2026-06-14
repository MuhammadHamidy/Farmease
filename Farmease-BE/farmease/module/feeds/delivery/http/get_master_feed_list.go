package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

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
