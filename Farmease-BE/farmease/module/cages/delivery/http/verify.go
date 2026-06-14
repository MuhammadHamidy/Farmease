package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// VerifyCage godoc
// @Summary      Verify cage by code
// @Description  Check if a cage code exists and get its details
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        code path      string  true  "Cage Code"
// @Success      200  {object}  domain.Cage
// @Failure      404  {object}  responses.Response[any]
// @Router       /api/cages/verify/{code} [get]
func (h *CageHandler) VerifyCage(c *fiber.Ctx) error {
	code := c.Params("code")
	res, err := h.useCase.VerifyCage(c.Context(), code)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
