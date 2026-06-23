package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// RecordFeedingMixture godoc
// @Summary      Record feeding mixture
// @Description  Record a mixture feeding event
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request   body      domain.FeedingMixture  true  "Mixture details"
// @Success      201       {object}  domain.FeedingMixture
// @Failure      400       {object}  responses.Response[any]
// @Failure      422       {object}  responses.Response[any]
// @Router       /api/feeds/mixtures [post]
func (h *FeedHandler) RecordFeedingMixture(c *fiber.Ctx) error {
	var mixtureData domain.FeedingMixture
	if err := c.BodyParser(&mixtureData); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	err := h.useCase.RecordFeedingMixture(c.Context(), &mixtureData)
	if err != nil {
		return c.Status(http.StatusUnprocessableEntity).JSON(responses.Fail("UNPROCESSABLE_ENTITY", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(mixtureData)
}
