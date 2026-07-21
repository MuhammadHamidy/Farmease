package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *TaskHandler) CompleteTask(c *fiber.Ctx) error {
	id := c.Params("id")
	subID, summary, err := h.useCase.CompleteTask(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message":       "Tugas berhasil diselesaikan",
		"id_task":       id,
		"id_submission": subID,
		"detail":        summary,
		"status":        "menunggu persetujuan admin",
	})
}
