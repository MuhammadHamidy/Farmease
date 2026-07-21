package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// DeleteCage godoc
// @Summary      Delete a cage
// @Description  Delete a cage by ID (fails if cage is not empty)
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Cage ID"
// @Success      204  "No Content"
// @Failure      409  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/cages/{id} [delete]
func (h *CageHandler) DeleteCage(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.DeleteCage(c.Context(), id)
	if err != nil {
		if err.Error() == "cage cannot be deleted because it still contains sheep" {
			return c.Status(http.StatusConflict).JSON(responses.Fail("CONFLICT", err.Error()))
		}
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Cage deleted successfully",
		"id":      id,
	})
}
