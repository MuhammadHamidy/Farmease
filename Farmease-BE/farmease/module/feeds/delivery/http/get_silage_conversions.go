package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetSilageConversions godoc
// @Summary      Get all silage conversions
// @Description  Retrieve all recorded silage conversion logs
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200       {array}   domain.SilageConversion
// @Failure      500       {object}  responses.Response[any]
// @Router       /api/feeds/conversions [get]
func (h *FeedHandler) GetSilageConversions(c *fiber.Ctx) error {
	list, err := h.useCase.GetSilageConversions(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("INTERNAL_SERVER_ERROR", err.Error()))
	}
	return c.JSON(list)
}
