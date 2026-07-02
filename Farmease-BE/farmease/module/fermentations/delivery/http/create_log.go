package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/fermentations/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *FermentationHandler) CreateFermentationLog(c *fiber.Ctx) error {
	conversionID := c.Params("id")
	var log domain.SilageFermentationLog
	if err := c.BodyParser(&log); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	log.IDConversion = conversionID
	if err := h.useCase.CreateLog(c.Context(), &log); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(log)
}
