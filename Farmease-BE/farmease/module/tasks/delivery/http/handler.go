package http

import (
	"strings"
	"github.com/farmease/farmease-be/farmease/module/tasks/domain"
	"github.com/farmease/farmease-be/libraries/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type TaskHandler struct {
	useCase domain.UseCase
	auth    *middleware.AuthorizationMiddleware
}

func NewTaskHandler(useCase domain.UseCase, auth *middleware.AuthorizationMiddleware) *TaskHandler {
	return &TaskHandler{
		useCase: useCase,
		auth:    auth,
	}
}

func extractAccountID(c *fiber.Ctx) string {
	// 1. Try to get from locals (standard production middleware)
	if userIdVal := c.Locals("X-User-Id"); userIdVal != nil {
		if userIdStr, ok := userIdVal.(string); ok && userIdStr != "" && userIdStr != "dev-user" {
			return userIdStr
		}
	}

	// 2. Try to get from Authorization header token (unverified fallback for development)
	authHeader := c.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			tokenStr := parts[1]
			claims := jwt.MapClaims{}
			_, _, err := new(jwt.Parser).ParseUnverified(tokenStr, &claims)
			if err == nil {
				if idAccount, ok := claims["id_account"].(string); ok && idAccount != "" {
					return idAccount
				}
			}
		}
	}

	// 3. Fallback mock for development
	return "11111111-1111-1111-1111-111111111101"
}

func (h *TaskHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	tasks := api.Group("/tasks", h.auth.Authenticate())
	tasks.Get("/", h.GetMyTasks)
	tasks.Post("/", h.CreateTask)
	tasks.Put("/:id", h.UpdateTask)
	tasks.Put("/:id/complete", h.CompleteTask)
	tasks.Delete("/:id", h.DeleteTask)
}
