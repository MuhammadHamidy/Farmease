package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// FindAll godoc
// @Summary      Get all routine schedules
// @Description  Retrieve all active/inactive routine schedules
// @Tags         routine-schedules
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array}   domain.RoutineSchedule
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/routine-schedules [get]
func (h *RoutineScheduleHandler) FindAll(c *fiber.Ctx) error {
	res, err := h.useCase.FindAll(c.Context())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
