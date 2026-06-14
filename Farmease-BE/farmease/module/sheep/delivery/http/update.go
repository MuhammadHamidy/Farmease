package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// UpdateSheep godoc
// @Summary      Update sheep details
// @Description  Update details of an existing sheep
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int  true  "Sheep ID"
// @Param        request  body      domain.Sheep  true  "Sheep details"
// @Success      200      {object}  domain.Sheep
// @Failure      400      {object}  responses.Response[any]
// @Failure      500      {object}  responses.Response[any]
// @Router       /api/sheep/{id} [put]
func (h *SheepHandler) UpdateSheep(c *fiber.Ctx) error {
	id := c.Params("id")
	var s domain.Sheep
	if err := c.BodyParser(&s); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.UpdateSheep(c.Context(), id, &s)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(s)
}
