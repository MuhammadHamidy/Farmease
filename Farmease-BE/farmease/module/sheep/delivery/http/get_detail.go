package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetSheepDetail godoc
// @Summary      Get details of a sheep
// @Description  Retrieve specific sheep details by ID
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Sheep ID"
// @Success      200  {object}  domain.Sheep
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/sheep/{id} [get]
func (h *SheepHandler) GetSheepDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetSheepDetail(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Sheep not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}
