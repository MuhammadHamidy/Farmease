package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *SubmissionHandler) GetSubmissionByID(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetSubmissionByID(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	if res == nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Submission not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}
