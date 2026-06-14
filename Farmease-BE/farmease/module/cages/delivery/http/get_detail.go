package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetCageDetail godoc
// @Summary      Get details of a cage
// @Description  Retrieve specific cage details by ID
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      200  {object}  domain.Cage
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/{id} [get]
func (h *CageHandler) GetCageDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetCageDetail(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Cage not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}
