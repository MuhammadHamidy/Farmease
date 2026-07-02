package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *SubmissionHandler) DeleteSubmission(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.DeleteSubmission(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Submission deleted successfully",
		"id":      id,
	})
}
