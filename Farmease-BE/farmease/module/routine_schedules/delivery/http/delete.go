package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

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
