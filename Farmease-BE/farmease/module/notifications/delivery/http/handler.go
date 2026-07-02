package http

import (
	"strings"
	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/libraries/middleware"
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
	// 1. Try X-User-Id header/locals
	if userIdVal := c.Locals("X-User-Id"); userIdVal != nil {
		if userIdStr, ok := userIdVal.(string); ok && userIdStr != "" && userIdStr != "dev-user" {
			return userIdStr
		}
	}

	// 2. Parse Bearer Token
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

	// 3. Fallback mock
	return "11111111-1111-1111-1111-111111111101"
}

func (h *NotificationHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	notif := api.Group("/notifications", h.auth.Authenticate())
	notif.Get("/", h.GetMyNotifications)
	notif.Patch("/:id/read", h.ReadNotification)
}

// GetMyNotifications godoc
// @Summary      Get my notifications
// @Description  Retrieve notifications for the authenticated user
// @Tags         notifications
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {array}   domain.Notification
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/notifications [get]

// ReadNotification godoc
// @Summary      Read notification
// @Description  Mark a notification as read
// @Tags         notifications
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      int  true  "Notification ID"
// @Success      200  {object}  object
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/notifications/{id}/read [patch]
