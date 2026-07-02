package http

import (
	"net/http"
	responses "github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *PregnancyHandler) GetPregnancyList(c *fiber.Ctx) error {
	status := c.Query("pregnancy_status")
	res, err := h.useCase.GetPregnancyList(c.Context(), status)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
