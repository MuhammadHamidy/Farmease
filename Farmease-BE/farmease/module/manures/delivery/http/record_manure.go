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
	var manure domain.Manure
	if err := c.BodyParser(&manure); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	manure.IDSheep = id
	if manure.DestinationType == "" {
		manure.DestinationType = "internal"
	}

	if appErr := validation.ValidateStruct(&manure); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.RecordManure(c.Context(), &manure)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(manure)
}

func (h *ManureHandler) RecordManureForCage(c *fiber.Ctx) error {
	id := c.Params("id")
	var manure domain.Manure
	if err := c.BodyParser(&manure); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	manure.IDCage = id
	if manure.DestinationType == "" {
		manure.DestinationType = "internal"
	}

	if appErr := validation.ValidateStruct(&manure); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.RecordManure(c.Context(), &manure)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(http.StatusCreated).JSON(manure)
}
