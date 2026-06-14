package http

import (
	"fmt"
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetCageStats godoc
// @Summary      Get stats of a cage
// @Description  Retrieve sheep statistics for a specific cage
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      200  {object}  domain.CageStats
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/{id}/stats [get]
func (h *CageHandler) GetCageStats(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetCageStats(c.Context(), id)
	if err != nil {
		fmt.Printf("ERROR in GetCageStats: %v\n", err)
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
