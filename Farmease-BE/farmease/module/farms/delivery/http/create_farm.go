package http

import (
"net/http"

"github.com/farmease/farmease-be/farmease/module/farms/domain"
"github.com/farmease/farmease-be/libraries/errors"
"github.com/farmease/farmease-be/libraries/middleware"
"github.com/farmease/farmease-be/libraries/responses"
"github.com/farmease/farmease-be/libraries/validation"
"github.com/gofiber/fiber/v2"
)

type CreateFarmRequest struct {
Code        string  `json:"code" validate:"required,max=45"`
Name        string  `json:"name" validate:"required,max=255"`
Location    *string `json:"location" validate:"omitempty,max=255"`
Description *string `json:"description" validate:"omitempty"`
}

// CreateFarm godoc
// @Summary      Create a new farm
// @Description  Register a new farm in the system
// @Tags         farms
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        request body      CreateFarmRequest  true  "Farm details"
// @Success      201     {object}  responses.Response[domain.Farm]
// @Failure      400     {object}  responses.Response[any]
// @Failure      401     {object}  responses.Response[any]
// @Failure      500     {object}  responses.Response[any]
// @Router       /farms [post]
func (h *FarmHandler) CreateFarm(c *fiber.Ctx) error {
ctx := c.UserContext()

userId, ok := c.Locals(middleware.XUserIdKey).(string)
if !ok || userId == "" {
return h.handleError(c, errors.Unauthorized("Invalid or missing user context"))
}

raw := c.Locals(validation.ValidatedBodyKey)
req, ok := raw.(*CreateFarmRequest)
if !ok || req == nil {
return h.handleError(c, errors.BadRequest("invalid request body"))
}

farm := domain.Farm{
Code:        req.Code,
Name:        req.Name,
Location:    req.Location,
Description: req.Description,
CreatedBy:   &userId,
}

if err := h.useCase.Create(ctx, &farm); err != nil {
return h.handleError(c, err)
}

return c.Status(http.StatusCreated).JSON(responses.Success(farm, "Farm created successfully"))
}
