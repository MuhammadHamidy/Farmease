package http

import (
	"github.com/farmease/farmease-be/farmease/module/submissions/domain"
	"github.com/farmease/farmease-be/libraries/middleware"
	"github.com/gofiber/fiber/v2"
)




type SubmissionHandler struct {
	useCase domain.UseCase
	auth    *middleware.AuthorizationMiddleware
}

func NewSubmissionHandler(useCase domain.UseCase, auth *middleware.AuthorizationMiddleware) *SubmissionHandler {
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
