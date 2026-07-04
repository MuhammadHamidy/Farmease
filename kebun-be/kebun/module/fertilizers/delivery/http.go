package http

import (
	nethttp "net/http"

	"github.com/farmease/kebun-be/kebun/module/fertilizers/domain"
	"github.com/farmease/kebun-be/libraries/responses"
	"github.com/gofiber/fiber/v2"
)

type FertilizersHandler struct {
	useCase domain.UseCase
}

func NewHandler(useCase domain.UseCase) *FertilizersHandler {
	return &FertilizersHandler{useCase: useCase}
}

// GetRecommendation godoc
// @Summary      Get fertilizer recommendation
// @Description  Calculate fertilizer recommendation for all trees based on their phase and manure stock
// @Tags         fertilizers
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200  {object}  domain.HasilRekomendasiLengkap
// @Failure      500  {object}  responses.Response[any]
// @Router       /api/fertilizers/recommendation [get]
func (h *FertilizersHandler) GetRecommendation(c *fiber.Ctx) error {
	res, err := h.useCase.GetFertilizerRecommendation(c.Context())
	if err != nil {
		return c.Status(nethttp.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
	}
	return c.Status(nethttp.StatusOK).JSON(res)
}

