package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetCageWeightStats godoc
// @Summary      Get weight stats of a cage
// @Description  Retrieve monthly aggregated weight statistics for a specific cage
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      200  {object}  domain.CageWeightStats
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/{id}/weight-stats [get]
func (h *CageHandler) GetCageWeightStats(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetCageWeightStats(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
