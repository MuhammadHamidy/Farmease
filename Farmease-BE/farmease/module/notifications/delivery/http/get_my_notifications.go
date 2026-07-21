package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *NotificationHandler) GetMyNotifications(c *fiber.Ctx) error {
	idAccount := extractAccountID(c)
	res, err := h.useCase.GetMyNotifications(c.Context(), idAccount)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
