package http

import (
	"fmt"
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// RegisterSheep godoc
// @Summary      Register a new sheep
// @Description  Create a new sheep entry with initial details
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      domain.Sheep  true  "Sheep details"
// @Success      201     {object}  domain.Sheep
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/sheep [post]
func (h *SheepHandler) RegisterSheep(c *fiber.Ctx) error {
	var s domain.Sheep
	if err := c.BodyParser(&s); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}
	fmt.Printf("DEBUG: Parsed JSON: UmurMethod='%s', PoelLevel='%s'\n", s.UmurMethod, s.PoelLevel)

	err := h.useCase.RegisterSheep(c.Context(), &s)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusCreated).JSON(s)
}
