package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetFeedingList godoc
// @Summary      Get list of all feedings
// @Description  Retrieve all feeding records across the system with filtering and pagination
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id_sheep       query     string  false  "Filter by sheep ID"
// @Param        page           query     int     false  "Page number"
// @Param        per_page       query     int     false  "Items per page"
// @Success      200            {array}   domain.Feeding
// @Failure      500            {object}  responses.Response[any]
// @Router       /api/feedings [get]
func (h *FeedHandler) GetFeedingList(c *fiber.Ctx) error {
	filter := domain.FeedingFilter{
		IDSheep: c.Query("id_sheep"),
		Page:    c.QueryInt("page", 1),
		PerPage: c.QueryInt("per_page", 20),
	}

	res, _, err := h.useCase.GetFeedingList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
