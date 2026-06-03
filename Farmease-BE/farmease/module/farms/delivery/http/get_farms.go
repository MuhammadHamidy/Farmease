package http

import (
"net/http"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/farmease/farmease-be/libraries/responses"
"github.com/gofiber/fiber/v2"
)

type FarmQueryParam struct {
Limit  int    `query:"limit"`
Offset int    `query:"offset"`
Code   string `query:"code"`
Name   string `query:"name"`
}

// GetFarms godoc
// @Summary      Get list of farms
// @Description  Retrieve all farms with filters
// @Tags         farms
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        code   query     string  false  "Filter by farm code"
// @Param        name   query     string  false  "Filter by farm name"
// @Param        limit  query     int     false  "Limit"
// @Param        offset query     int     false  "Offset"
// @Success      200    {object}  responses.Response[[]domain.Farm]
// @Failure      500    {object}  responses.Response[any]
// @Router       /farms [get]
func (h *FarmHandler) GetFarms(c *fiber.Ctx) error {
var param FarmQueryParam
if err := c.QueryParser(&param); err != nil {
return h.handleError(c, err)
}

p := domain.FarmParam{
Limit:  param.Limit,
Offset: param.Offset,
Code:   param.Code,
Name:   param.Name,
}

farms, total, err := h.useCase.FindAll(c.Context(), &p)
if err != nil {
return h.handleError(c, err)
}

return c.Status(http.StatusOK).JSON(responses.SuccessWithMeta(farms, "Farms retrieved successfully", &responses.Meta{Total: int64(total)}))
}
