package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *HealthHandler) RecordHealth(c *fiber.Ctx) error {
	id := c.Params("id")
	var k domain.Health
	if err := c.BodyParser(&k); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	k.IDSheep = id

	if appErr := validation.ValidateStruct(&k); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.RecordHealth(c.Context(), &k)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(k)
}
