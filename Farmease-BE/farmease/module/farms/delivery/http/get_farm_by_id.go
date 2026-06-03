package http

import (
"net/http"

"github.com/farmease/farmease-be/libraries/responses"
"github.com/gofiber/fiber/v2"
"github.com/google/uuid"
)

// GetFarmByID godoc
// @Summary      Get farm details
// @Description  Retrieve specific farm details by ID
// @Tags         farms
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Farm ID"
// @Success      200  {object}  responses.Response[domain.Farm]
// @Failure      400  {object}  responses.Response[any]
// @Failure      404  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /farms/{id} [get]
func (h *FarmHandler) GetFarmByID(c *fiber.Ctx) error {
id, err := uuid.Parse(c.Params("id"))
if err != nil {
return c.Status(fiber.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", "Invalid farm ID format"))
}

farm, err := h.useCase.FindByID(c.Context(), id)
if err != nil || farm == nil {
return c.Status(fiber.StatusNotFound).JSON(responses.Fail("NOT_FOUND", "Farm not found"))
}

return c.Status(http.StatusOK).JSON(responses.Success(farm, "Farm retrieved successfully"))
}
