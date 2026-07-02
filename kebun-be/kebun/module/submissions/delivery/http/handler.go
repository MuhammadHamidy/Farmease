package http

import (
	"net/http"
	"time"

	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/farmease/farmease-be/libraries/middleware"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type SubmissionHandler struct {
	useCase domain.UseCase
	auth    *middleware.AuthorizationMiddleware
}

func NewSubmissionHandler(useCase domain.UseCase, auth *middleware.AuthorizationMiddleware) *SubmissionHandler {
	if useCase == nil {
		panic("useCase is nil in NewSubmissionHandler!!!")
	}
	if auth == nil {
		panic("auth is nil in NewSubmissionHandler!!!")
	}
	return &SubmissionHandler{
		useCase: useCase,
		auth:    auth,
	}
}

func (h *SubmissionHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	submissions := api.Group("/submissions", h.auth.Authenticate())
	submissions.Get("/", h.GetSubmissions)
	submissions.Get("/:id", h.GetSubmissionByID)
	submissions.Post("/", h.CreateSubmission)
	submissions.Put("/:id", h.UpdateSubmission)
	submissions.Delete("/:id", h.DeleteSubmission)
}

func (h *SubmissionHandler) GetSubmissions(c *fiber.Ctx) error {
	status := c.Query("status")
	submissionType := c.Query("type")

	res, err := h.useCase.GetAllSubmissions(c.Context(), status, submissionType)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

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

func (h *SubmissionHandler) CreateSubmission(c *fiber.Ctx) error {
	var item domain.Submission
	if err := c.BodyParser(&item); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.CreateSubmission(c.Context(), &item)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(item)
}

func (h *SubmissionHandler) UpdateSubmission(c *fiber.Ctx) error {
	id := c.Params("id")

	var req struct {
		Type           string                 `json:"type"`
		TypeLabel      string                 `json:"typeLabel"`
		OperatorCode   string                 `json:"operatorCode"`
		OperatorName   string                 `json:"operatorName"`
		CageCode       string                 `json:"cageCode"`
		Scope          string                 `json:"scope"`
		Summary        string                 `json:"summary"`
		Payload        map[string]interface{} `json:"payload"`
		ApprovalStatus string                 `json:"approvalStatus"`
		ReviewNote     *string                `json:"reviewNote"`
		ReviewedBy     *string                `json:"reviewedBy"`
		ReviewedAt     *string                `json:"reviewedAt"` // ISO string from frontend
		TaskID         *string                `json:"taskId"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
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

	if req.ReviewedAt != nil && *req.ReviewedAt != "" {
		parsed, err := time.Parse(time.RFC3339, *req.ReviewedAt)
		if err == nil {
			patch.ReviewedAt = &parsed
		} else {
			// Try RFC3339Nano
			parsed2, err2 := time.Parse(time.RFC3339Nano, *req.ReviewedAt)
			if err2 == nil {
				patch.ReviewedAt = &parsed2
			}
		}
	}

	err := h.useCase.UpdateSubmission(c.Context(), id, &patch)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}

func (h *SubmissionHandler) DeleteSubmission(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.DeleteSubmission(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}
