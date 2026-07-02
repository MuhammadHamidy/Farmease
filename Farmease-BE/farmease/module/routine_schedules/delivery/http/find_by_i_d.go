package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

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
