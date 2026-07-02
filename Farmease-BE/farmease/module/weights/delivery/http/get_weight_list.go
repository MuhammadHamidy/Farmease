package http

import (
	"net/http"
	"github.com/farmease/farmease-be/farmease/module/weights/domain"
	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

func (h *WeightHandler) GetWeightList(c *fiber.Ctx) error {
	filter := domain.WeightFilter{
		IDSheep: c.Query("id_sheep"),
		Page:    c.QueryInt("page", 1),
		PerPage: c.QueryInt("per_page", 100),
	}

	res, _, err := h.useCase.GetWeightList(c.Context(), filter)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}

	return c.Status(http.StatusOK).JSON(res)
}
