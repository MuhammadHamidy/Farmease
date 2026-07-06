package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetSubmissions godoc
// @Summary      Get list of submissions
// @Description  Retrieve all submissions with filtering by status or type
// @Tags         submissions
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        status  query     string  false  "Filter by status (pending, approved, rejected)"
// @Param        type    query     string  false  "Filter by type"
// @Success      200     {array}   domain.Submission
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/submissions [get]
func (h *SubmissionHandler) GetSubmissions(c *fiber.Ctx) error {
	status := c.Query("status")
	submissionType := c.Query("type")

	res, err := h.useCase.GetAllSubmissions(c.Context(), status, submissionType)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
