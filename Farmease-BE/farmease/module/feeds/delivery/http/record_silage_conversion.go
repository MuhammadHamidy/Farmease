package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// RecordSilageConversion godoc
// @Summary      Record silage conversion
// @Description  Record a silage conversion event
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request   body      domain.SilageConversion  true  "Conversion details"
// @Success      201       {object}  domain.SilageConversion
// @Failure      400       {object}  responses.Response[any]
// @Failure      422       {object}  responses.Response[any]
// @Router       /api/feeds/conversions [post]
func (h *FeedHandler) RecordSilageConversion(c *fiber.Ctx) error {
	var conversionData domain.SilageConversion
	if err := c.BodyParser(&conversionData); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	err := h.useCase.RecordSilageConversion(c.Context(), &conversionData)
	if err != nil {
		return c.Status(http.StatusUnprocessableEntity).JSON(responses.Fail("UNPROCESSABLE_ENTITY", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(conversionData)
}
