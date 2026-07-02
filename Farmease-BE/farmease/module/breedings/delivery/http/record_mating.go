package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/breedings/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *BreedingHandler) RecordMating(c *fiber.Ctx) error {
	var p domain.Mating
	if err := c.BodyParser(&p); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if p.Status == "" {
		p.Status = "proses"
	}

	if appErr := validation.ValidateStruct(&p); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.RecordMating(c.Context(), &p)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(p)
}
