package http

import (
"net/http"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/farmease/farmease-be/libraries/errors"
"github.com/farmease/farmease-be/libraries/middleware"
"github.com/farmease/farmease-be/libraries/responses"
"github.com/farmease/farmease-be/libraries/validation"
"github.com/gofiber/fiber/v2"
"github.com/google/uuid"
)

type UpdateFarmRequest struct {
Code        string  `json:"code" validate:"required,max=45"`
Name        string  `json:"name" validate:"required,max=255"`
Location    *string `json:"location" validate:"omitempty,max=255"`
Description *string `json:"description" validate:"omitempty"`
}

// UpdateFarm godoc
// @Summary      Update a farm
// @Description  Update details of an existing farm
// @Tags         farms
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      string             true  "Farm ID"
// @Param        request body      UpdateFarmRequest  true  "Farm details"
// @Success      200     {object}  responses.Response[domain.Farm]
// @Failure      400     {object}  responses.Response[any]
// @Failure      401     {object}  responses.Response[any]
// @Failure      404     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /farms/{id} [put]
func (h *FarmHandler) UpdateFarm(c *fiber.Ctx) error {
ctx := c.UserContext()

id, err := uuid.Parse(c.Params("id"))
if err != nil {
return c.Status(fiber.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", "Invalid farm ID format"))
}

userId, ok := c.Locals(middleware.XUserIdKey).(string)
if !ok || userId == "" {
return h.handleError(c, errors.Unauthorized("Invalid or missing user context"))
}

raw := c.Locals(validation.ValidatedBodyKey)
req, ok := raw.(*UpdateFarmRequest)
if !ok || req == nil {
return h.handleError(c, errors.BadRequest("invalid request body"))
}

farm := domain.Farm{
Code:        req.Code,
Name:        req.Name,
Location:    req.Location,
Description: req.Description,
UpdatedBy:   &userId,
}

if err := h.useCase.Update(ctx, id, &farm); err != nil {
return h.handleError(c, err)
}

return c.Status(http.StatusOK).JSON(responses.Success(farm, "Farm updated successfully"))
}
