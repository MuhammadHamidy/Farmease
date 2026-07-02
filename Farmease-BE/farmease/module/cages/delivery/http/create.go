package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/cages/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

// CreateCage godoc
// @Summary      Create a new cage
// @Description  Create a new sheep cage with capacity and code
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Cage  true  "Cage details"
// @Success      201     {object}  domain.Cage
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/cages [post]
func (h *CageHandler) CreateCage(c *fiber.Ctx) error {
	var k domain.Cage
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if appErr := validation.ValidateStruct(&k); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.CreateCage(c.Context(), &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(k)
}
