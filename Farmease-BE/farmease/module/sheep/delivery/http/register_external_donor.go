package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

type ExternalDonorRequest struct {
	Name   string `json:"name" validate:"required"`
	Origin string `json:"origin" validate:"required"`
}

// RegisterExternalDonor godoc
// @Summary      Register or get an external semen donor
// @Description  Create an external sheep entry for semen donor if not exists, otherwise retrieve existing one
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      ExternalDonorRequest  true  "External Donor details"
// @Success      200     {object}  domain.Sheep
// @Failure      400     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /api/sheep/external-donor [post]
func (h *SheepHandler) RegisterExternalDonor(c *fiber.Ctx) error {
	var req ExternalDonorRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if appErr := validation.ValidateStruct(&req); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	donor, err := h.useCase.GetOrCreateExternalDonor(c.Context(), req.Name, req.Origin)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(donor)
}
