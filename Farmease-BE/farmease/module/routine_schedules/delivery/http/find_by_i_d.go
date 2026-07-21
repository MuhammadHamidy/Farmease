package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// FindByID godoc
// @Summary      Get routine schedule by ID
// @Description  Retrieve detail of a routine schedule by its ID
// @Tags         routine-schedules
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Routine Schedule ID"
// @Success      200  {object}  domain.RoutineSchedule
// @Failure      404  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/routine-schedules/{id} [get]
func (h *RoutineScheduleHandler) FindByID(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.FindByID(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	if res == nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "routine schedule not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}
