package http

import (
	"net/http"
	"time"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *TaskHandler) GetMyTasks(c *fiber.Ctx) error {
	idAccount := extractAccountID(c)
	var roleName string
	if roleVal := c.Locals("X-Role-Name"); roleVal != nil {
		if roleStr, ok := roleVal.(string); ok {
			roleName = roleStr
		}
	}

	dateStr := c.Query("date")
	var date *time.Time
	if dateStr != "" {
		parsedTime, _ := time.Parse("2006-01-02", dateStr)
		date = &parsedTime
	}

	res, err := h.useCase.GetMyTasks(c.Context(), idAccount, roleName, date)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
