package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// Delete godoc
// @Summary      Delete a routine schedule
// @Description  Delete a routine schedule by its ID
// @Tags         routine-schedules
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Routine Schedule ID"
// @Success      200  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/routine-schedules/{id} [delete]
func (h *RoutineScheduleHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.Delete(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Routine schedule deleted successfully",
		"id":      id,
	})
}
