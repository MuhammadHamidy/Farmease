package http

import (
	"net/http"
	responses "github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *PregnancyHandler) GetBirthHistory(c *fiber.Ctx) error {
	res, err := h.useCase.GetBirthHistory(c.Context(), nil, nil)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
