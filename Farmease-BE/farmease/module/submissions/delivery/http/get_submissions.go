package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *SubmissionHandler) GetSubmissions(c *fiber.Ctx) error {
	status := c.Query("status")
	submissionType := c.Query("type")

	res, err := h.useCase.GetAllSubmissions(c.Context(), status, submissionType)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
