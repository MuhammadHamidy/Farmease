package http

import (
	"net/http"
	responses "github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *PregnancyHandler) UpdatePregnancyStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		PregnancyStatus string `json:"pregnancy_status"`
		Status          string `json:"status"` // fallback for FE
		Notes           string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	status := req.PregnancyStatus
	if status == "" {
		status = req.Status
	}

	updated, err := h.useCase.UpdatePregnancyStatus(c.Context(), id, status, req.Notes)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(updated)
}
