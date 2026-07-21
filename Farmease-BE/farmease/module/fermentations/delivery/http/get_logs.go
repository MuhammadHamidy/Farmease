package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetFermentationLogs godoc
// @Summary      Get fermentation logs
// @Description  Retrieve all fermentation logs for a specific silage conversion ID
// @Tags         fermentations
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Silage Conversion ID"
// @Success      200  {array}   domain.SilageFermentationLog
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/fermentations/conversions/{id}/logs [get]
func (h *FermentationHandler) GetFermentationLogs(c *fiber.Ctx) error {
	conversionID := c.Params("id")
	logs, err := h.useCase.GetLogs(c.Context(), conversionID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(logs)
}
