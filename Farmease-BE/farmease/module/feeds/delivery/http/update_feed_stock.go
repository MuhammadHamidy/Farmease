package http

import (
	"net/http"

	"github.com/farmease/farmease-be/libraries/responses"
	"github.com/farmease/farmease-be/libraries/validation"
	"github.com/gofiber/fiber/v2"
)

// UpdateFeedStock godoc
// @Summary      Update feed stock
// @Description  Add or subtract feed stock
// @Tags         feeds
// @Accept       json
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id      path      string  true  "Feed ID"
// @Param        request body      object  true  "Stock update details"
// @Success      200     {object}  object
// @Failure      400     {object}  responses.Response[any]
// @Failure      422     {object}  responses.Response[any]
// @Router       /api/feeds/{id}/stock [patch]
func (h *FeedHandler) UpdateFeedStock(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		Amount float64 `json:"amount" validate:"required,gt=0"`
		Type   string  `json:"type" validate:"required,oneof=tambah kurang add subtract add_stock use_stock reduce_stock"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(responses.Fail("BAD_REQUEST", err.Error()))
	}

	if appErr := validation.ValidateStruct(&req); appErr != nil {
		return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
	}

	actionType := req.Type
	if actionType == "add" || actionType == "add_stock" || actionType == "tambah" {
		actionType = "tambah"
	} else if actionType == "subtract" || actionType == "use_stock" || actionType == "reduce_stock" || actionType == "kurang" {
		actionType = "kurang"
	}

	updated, err := h.useCase.UpdateFeedStock(c.Context(), id, req.Amount, actionType)
	if err != nil {
		return c.Status(http.StatusUnprocessableEntity).JSON(responses.Fail("UNPROCESSABLE_ENTITY", err.Error()))
	}
	return c.Status(http.StatusOK).JSON(updated)
}
