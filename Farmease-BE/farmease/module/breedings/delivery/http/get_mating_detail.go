package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *BreedingHandler) GetMatingDetail(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetMatingDetail(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Mating record not found"))
	}
	return c.Status(http.StatusOK).JSON(res)
}
