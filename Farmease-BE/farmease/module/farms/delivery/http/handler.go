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

type FarmHandler struct {
useCase domain.UseCase
auth    *middleware.AuthorizationMiddleware
}

func NewFarmHandler(useCase domain.UseCase, auth *middleware.AuthorizationMiddleware) *FarmHandler {
return &FarmHandler{
useCase: useCase,
auth:    auth,
}
}

func (h *FarmHandler) RegisterRoutes(app *fiber.App) {
group := app.Group("/farms", middleware.TraceMiddleware)

group.Get("/", h.auth.Authenticate("farms.livestock.farms.view"), h.GetFarms)
group.Get("/:id", h.auth.Authenticate("farms.livestock.farms.view"), h.GetFarmByID)
group.Post("/", h.auth.Authenticate("farms.livestock.farms.create"), validation.ValidateBody(func() interface{} { return &CreateFarmRequest{} }), h.CreateFarm)
group.Put("/:id", h.auth.Authenticate("farms.livestock.farms.edit"), validation.ValidateBody(func() interface{} { return &UpdateFarmRequest{} }), h.UpdateFarm)
group.Delete("/:id", h.auth.Authenticate("farms.livestock.farms.delete"), h.DeleteFarm)
}

func (h *FarmHandler) handleError(c *fiber.Ctx, err error) error {
if appErr, ok := err.(*errors.AppError); ok {
return c.Status(appErr.Code).JSON(responses.Fail(string(appErr.Type), appErr.Message))
}
return c.Status(http.StatusInternalServerError).JSON(responses.Fail("SYSTEM_ERROR", err.Error()))
}
