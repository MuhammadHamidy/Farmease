package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *SubmissionHandler) CreateSubmission(c *fiber.Ctx) error {
	var item domain.Submission
	if err := c.BodyParser(&item); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if item.ApprovalStatus == "" {
		item.ApprovalStatus = "pending"
	}

	if appErr := validation.ValidateStruct(&item); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.CreateSubmission(c.Context(), &item)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(item)
}
