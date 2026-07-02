package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *FermentationHandler) GetFermentationLogs(c *fiber.Ctx) error {
	conversionID := c.Params("id")
	logs, err := h.useCase.GetLogs(c.Context(), conversionID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(logs)
}
