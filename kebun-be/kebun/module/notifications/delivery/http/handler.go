package http

import (
	"net/http"
	"strings"

	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/libraries/middleware"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type NotificationHandler struct {
	useCase domain.UseCase
	auth    *middleware.AuthorizationMiddleware
}

func NewNotificationHandler(useCase domain.UseCase, auth *middleware.AuthorizationMiddleware) *NotificationHandler {
	return &NotificationHandler{
		useCase: useCase,
		auth:    auth,
	}
}

func extractAccountID(c *fiber.Ctx) string {
	if userIdVal := c.Locals("X-User-Id"); userIdVal != nil {
		if userIdStr, ok := userIdVal.(string); ok && userIdStr != "" && userIdStr != "dev-user" {
			return userIdStr
		}
	}

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

	return "11111111-1111-1111-1111-111111111101"
}

func (h *NotificationHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	notif := api.Group("/notifications", h.auth.Authenticate())
	notif.Get("/", h.GetMyNotifications)
	notif.Patch("/:id/read", h.ReadNotification)
}

func (h *NotificationHandler) GetMyNotifications(c *fiber.Ctx) error {
	idAccount := extractAccountID(c)
	res, err := h.useCase.GetMyNotifications(c.Context(), idAccount)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

func (h *NotificationHandler) ReadNotification(c *fiber.Ctx) error {
	id := c.Params("id")
	err := h.useCase.ReadNotification(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}
