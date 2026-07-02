package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/manures/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *ManureHandler) RecordManure(c *fiber.Ctx) error {
	id := c.Params("id")
	var m domain.Manure
	if err := c.BodyParser(&m); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	m.IDSheep = id
	if m.DestinationType == "" {
		m.DestinationType = "internal"
	}

	if appErr := validation.ValidateStruct(&m); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.RecordManure(c.Context(), &m)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(m)
}

func (h *ManureHandler) RecordManureForCage(c *fiber.Ctx) error {
	id := c.Params("id")
	var m domain.Manure
	if err := c.BodyParser(&m); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	m.IDCage = id
	if m.DestinationType == "" {
		m.DestinationType = "internal"
	}

	if appErr := validation.ValidateStruct(&m); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.RecordManure(c.Context(), &m)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(m)
}
