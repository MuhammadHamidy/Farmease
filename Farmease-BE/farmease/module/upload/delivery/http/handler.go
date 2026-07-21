package http

import (
	"github.com/gofiber/fiber/v2"
)




type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

func (h *UploadHandler) RegisterRoutes(app *fiber.App) {
	group := app.Group("/api/upload")
	group.Post("/photo", h.UploadPhoto)
}
