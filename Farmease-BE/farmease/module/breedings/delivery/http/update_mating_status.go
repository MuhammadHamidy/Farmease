package http

import (
	"net/http"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

func (h *BreedingHandler) UpdateMatingStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status string `json:"status" validate:"required,oneof=proses sukses gagal"`
		Notes  string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if appErr := validation.ValidateStruct(&req); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	err := h.useCase.UpdateMatingStatus(c.Context(), id, req.Status, req.Notes)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	updated, err := h.useCase.GetMatingDetail(c.Context(), id)
	if err != nil || updated == nil {
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"message":   "Mating status updated successfully",
			"id_mating": id,
			"status":    req.Status,
		})
	}
	return c.Status(http.StatusOK).JSON(updated)
}
