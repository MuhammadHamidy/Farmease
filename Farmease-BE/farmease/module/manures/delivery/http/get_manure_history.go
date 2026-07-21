package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *ManureHandler) GetManureHistory(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetManureHistory(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}

func (h *ManureHandler) GetManureHistoryByCage(c *fiber.Ctx) error {
	id := c.Params("id")
	res, err := h.useCase.GetManureHistoryByCage(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(res)
}
