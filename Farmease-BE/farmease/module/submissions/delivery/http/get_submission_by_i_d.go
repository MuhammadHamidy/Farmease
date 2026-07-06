package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetSubmissionByID godoc
// @Summary      Get submission by ID
// @Description  Retrieve details of a submission by its ID
// @Tags         submissions
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Submission ID"
// @Success      200  {object}  domain.Submission
// @Failure      404  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/submissions/{id} [get]
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
