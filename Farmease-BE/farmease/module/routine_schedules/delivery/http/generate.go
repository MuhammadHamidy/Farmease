package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *RoutineScheduleHandler) Generate(c *fiber.Ctx) error {
	var req struct {
		WindowDays int `json:"window_days"`
	}
	_ = c.BodyParser(&req)
	if req.WindowDays <= 0 {
		req.WindowDays = 7
	}

	err := h.useCase.GenerateTasks(c.Context(), req.WindowDays)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message":     "Tugas rutin berhasil digenerasikan",
		"window_days": req.WindowDays,
	})
}
