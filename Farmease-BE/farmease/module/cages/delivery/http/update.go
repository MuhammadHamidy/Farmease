package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/cages/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

// UpdateCage godoc
// @Summary      Update a cage
// @Description  Update details of an existing cage
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int             true  "Cage ID"
// @Param        request  body      domain.Cage  true  "Cage details"
// @Success      200      {object}  domain.Cage
// @Failure      400      {object}  responses.Response[any]
// @Failure      500      {object}  responses.Response[any]
// @Router       /api/cages/{id} [put]
func (h *CageHandler) UpdateCage(c *fiber.Ctx) error {
	id := c.Params("id")
	var k domain.Cage
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if appErr := validation.ValidateStruct(&k); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.UpdateCage(c.Context(), id, &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(k)
}
