package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/pregnancies/domain"
	responses "github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *PregnancyHandler) RecordPregnancy(c *fiber.Ctx) error {
	var k domain.Pregnancy
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.RecordPregnancy(c.Context(), &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(k)
}
