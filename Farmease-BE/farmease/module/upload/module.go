package upload

import (
	"github.com/farmease/farmease-be/farmease/module/upload/delivery/http"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
)

var Module = fx.Options(
	fx.Provide(
		http.NewUploadHandler,
	),
	fx.Invoke(registerRoutes),
)

func registerRoutes(h *http.UploadHandler, app *fiber.App) {
	h.RegisterRoutes(app)
}
