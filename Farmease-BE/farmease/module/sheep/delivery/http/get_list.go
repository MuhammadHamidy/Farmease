package http

import (
	"net/http"

	"github.com/farmease/farmease-be/farmease/module/sheep/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

// GetSheepList godoc
// @Summary      Get list of all sheep
// @Description  Retrieve all sheep with filtering by cage, gender, and status
// @Tags         sheep
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id_cage       query     int     false  "Filter by cage ID"
// @Param        gender        query     string  false  "Filter by gender (Jantan/Betina)"
// @Param        status        query     string  false  "Filter by status"
// @Param        search        query     string  false  "Search by tag or nickname"
// @Param        page          query     int     false  "Page number"
// @Param        per_page      query     int     false  "Items per page"
// @Success      200           {array}   domain.Sheep
// @Failure      500           {object}  responses.Response[any]
// @Router       /api/sheep [get]
func (h *SheepHandler) GetSheepList(c *fiber.Ctx) error {
	filter := domain.SheepFilter{
		IDCage:    c.Query("id_cage"),
		Gender:    c.Query("gender"),
		Status:    c.Query("status"),
		Search:    c.Query("search"),
		Page:      c.QueryInt("page", 1),
		PerPage:   c.QueryInt("per_page", 100),
	}

	res, _, err := h.useCase.GetSheepList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
