package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/feeds/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// RecordFeeding godoc
// @Summary      Record feeding
// @Description  Record that a sheep has been fed
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id        path      string          true  "Sheep ID"
// @Param        request   body      domain.Feeding  true  "Feeding details"
// @Success      201       {object}  domain.Feeding
// @Failure      400       {object}  responses.Response[any]
// @Failure      422       {object}  responses.Response[any]
// @Router       /api/sheep/{id}/feedings [post]
func (h *FeedHandler) RecordFeeding(c *fiber.Ctx) error {
	id := c.Params("id")
	var feedingData domain.Feeding
	if err := c.BodyParser(&feedingData); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	feedingData.IDSheep = id
	err := h.useCase.RecordFeeding(c.Context(), &feedingData)
	if err != nil {
		return c.Status(http.StatusUnprocessableEntity).JSON(responses.Fail("UNPROCESSABLE_ENTITY", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(feedingData)
}
