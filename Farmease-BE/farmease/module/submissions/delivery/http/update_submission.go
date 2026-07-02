package http

import (
	"net/http"
	"time"
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *SubmissionHandler) UpdateSubmission(c *fiber.Ctx) error {
	id := c.Params("id")
	
	// Create a temporary struct to handle patch updates, specifically review times and strings
	var req struct {
		Type           string                 `json:"type"`
		TypeLabel      string                 `json:"typeLabel"`
		OperatorCode   string                 `json:"operatorCode"`
		OperatorName   string                 `json:"operatorName"`
		CageCode       string                 `json:"cageCode"`
		Scope          string                 `json:"scope"`
		Summary        string                 `json:"summary"`
		Payload        map[string]interface{} `json:"payload"`
		ApprovalStatus string                 `json:"approvalStatus" validate:"omitempty,oneof=pending approved rejected"`
		ReviewNote     *string                `json:"reviewNote"`
		ReviewedBy     *string                `json:"reviewedBy"`
		ReviewedAtMs   *int64                 `json:"reviewedAt"` // milliseconds timestamp from frontend
		TaskID         *string                `json:"taskId"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if appErr := validation.ValidateStruct(&req); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	patch := domain.Submission{
		Type:           req.Type,
		TypeLabel:      req.TypeLabel,
		OperatorCode:   req.OperatorCode,
		OperatorName:   req.OperatorName,
		CageCode:       req.CageCode,
		Scope:          req.Scope,
		Summary:        req.Summary,
		Payload:        req.Payload,
		ApprovalStatus: req.ApprovalStatus,
		ReviewNote:     req.ReviewNote,
		ReviewedBy:     req.ReviewedBy,
		TaskID:         req.TaskID,
	}

	if req.ReviewedAtMs != nil {
		t := time.UnixMilli(*req.ReviewedAtMs)
		patch.ReviewedAt = &t
	}

	// 1. Execute the update
	err := h.useCase.UpdateSubmission(c.Context(), id, &patch)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	// 2. Fetch and return the fully updated submission
	updated, err := h.useCase.GetSubmissionByID(c.Context(), id)
	if err != nil || updated == nil {
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"message": "Submission updated successfully",
			"id":      id,
		})
	}
	return c.Status(http.StatusOK).JSON(updated)
}
