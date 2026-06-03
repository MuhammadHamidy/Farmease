package http

import (
	"net/http"
	"strconv"

	"github.com/farmease/farmease-be/farmease/module/notifications/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type NotificationHandler struct {
	useCase domain.UseCase
}

func NewNotificationHandler(useCase domain.UseCase) *NotificationHandler {
	return &NotificationHandler{useCase: useCase}
}

func (h *NotificationHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api")

	notif := api.Group("/notifications")
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
func (h *NotificationHandler) GetMyNotifications(c *fiber.Ctx) error {
	idAccount := 1 // Mock
	res, err := h.useCase.GetMyNotifications(c.Context(), idAccount)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

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
func (h *NotificationHandler) ReadNotification(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	err := h.useCase.ReadNotification(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success"})
}
