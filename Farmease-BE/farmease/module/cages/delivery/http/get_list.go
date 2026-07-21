package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/cages/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetCageList godoc
// @Summary      Get list of all cages
// @Description  Retrieve all cages with filtering by cage type
// @Tags         cages
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        cage_type      query     string  false  "Filter by cage type"
// @Param        page           query     int     false  "Page number"
// @Param        per_page       query     int     false  "Items per page"
// @Success      200            {array}   domain.Cage
// @Failure      500            {object}  responses.Response[any]
// @Router       /api/cages [get]
func (h *CageHandler) GetCageList(c *fiber.Ctx) error {
	filter := domain.CageFilter{
		CageType: c.Query("cage_type"),
		Page:     c.QueryInt("page", 1),
		PerPage:  c.QueryInt("per_page", 100),
	}

	res, _, err := h.useCase.GetCageList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
