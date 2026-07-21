package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// DeleteSubmission godoc
// @Summary      Delete a submission
// @Description  Delete a submission record by ID
// @Tags         submissions
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Submission ID"
// @Success      200  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/submissions/{id} [delete]
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
