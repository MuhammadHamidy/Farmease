package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetSheepGenealogy godoc
// @Summary      Get sheep genealogy
// @Description  Retrieve family tree of a sheep up to specified generations
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id        path      int  true   "Sheep ID"
// @Param        generation query     int  false  "Number of generations to traverse"
// @Success      200       {object}  domain.Genealogy
// @Failure      500       {object}  responses.Response[any]
// @Router       /api/sheep/{id}/genealogy [get]
func (h *SheepHandler) GetSheepGenealogy(c *fiber.Ctx) error {
	id := c.Params("id")
	generation := c.QueryInt("generation", 3)

	res, err := h.useCase.GetSheepGenealogy(c.Context(), id, generation)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
