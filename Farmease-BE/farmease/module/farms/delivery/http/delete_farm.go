package http

import (
"net/http"

"github.com/farmease/farmease-be/libraries/errors"
"github.com/farmease/farmease-be/libraries/middleware"
"github.com/farmease/farmease-be/libraries/responses"
"github.com/gofiber/fiber/v2"
"github.com/google/uuid"
)

// DeleteFarm godoc
// @Summary      Delete a farm
// @Description  Delete a farm by ID
// @Tags         farms
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id   path      string  true  "Farm ID"
// @Success      200  {object}  responses.Response[any]
// @Failure      400  {object}  responses.Response[any]
// @Failure      401  {object}  responses.Response[any]
// @Failure      404  {object}  responses.Response[any]
// @Failure      500  {object}  responses.Response[any]
// @Router       /farms/{id} [delete]
func (h *FarmHandler) DeleteFarm(c *fiber.Ctx) error {
id, err := uuid.Parse(c.Params("id"))
if err != nil {
return c.Status(fiber.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", "Invalid farm ID format"))
}

userId, ok := c.Locals(middleware.XUserIdKey).(string)
if !ok || userId == "" {
return h.handleError(c, errors.Unauthorized("Invalid or missing user context"))
}

if err := h.useCase.Delete(c.Context(), id, userId); err != nil {
return h.handleError(c, err)
}

return c.Status(http.StatusOK).JSON(responses.Success(map[string]interface{}{}, "Farm deleted successfully"))
}
