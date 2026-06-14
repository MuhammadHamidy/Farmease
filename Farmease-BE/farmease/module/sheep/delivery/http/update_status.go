package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// UpdateSheepStatus godoc
// @Summary      Update sheep status
// @Description  Update the status of a sheep
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id       path      int  true  "Sheep ID"
// @Param        request  body      object  true  "Status details"
// @Success      200      {object}  object
// @Failure      400      {object}  responses.Response[any]
// @Failure      500      {object}  responses.Response[any]
// @Router       /api/sheep/{id}/status [patch]
func (h *SheepHandler) UpdateSheepStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Status  string `json:"status"`
		Notes   string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	err := h.useCase.UpdateSheepStatus(c.Context(), id, req.Status, req.Notes)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"id_sheep":   id,
		"status":     req.Status,
		"updated_at": "now",
	})
}
