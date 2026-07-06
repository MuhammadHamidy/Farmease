package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// CreateFermentationLog godoc
// @Summary      Create fermentation log
// @Description  Create a new fermentation log for a silage conversion process
// @Tags         fermentations
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      string                       true  "Silage Conversion ID"
// @Param        request body      domain.SilageFermentationLog true  "Fermentation Log details"
// @Success      201     {object}  domain.SilageFermentationLog
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/fermentations/conversions/{id}/logs [post]
func (h *FermentationHandler) CreateFermentationLog(c *fiber.Ctx) error {
	conversionID := c.Params("id")
	var log domain.SilageFermentationLog
	if err := c.BodyParser(&log); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	log.IDConversion = conversionID
	if err := h.useCase.CreateLog(c.Context(), &log); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(log)
}
