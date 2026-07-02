package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/healths/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *HealthHandler) GetHealthList(c *fiber.Ctx) error {
	filter := domain.HealthFilter{
		IDSheep: c.Query("id_sheep"),
		Page:    c.QueryInt("page", 1),
		PerPage: c.QueryInt("per_page", 100),
	}

	res, _, err := h.useCase.GetHealthList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
