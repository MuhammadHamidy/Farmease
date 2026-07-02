package pembersihan

import (
	"github.com/farmease/farmease-be/farmease/module/pembersihan/delivery/http"
	"github.com/farmease/farmease-be/farmease/module/pembersihan/repository/postgresql"
	"github.com/farmease/farmease-be/farmease/module/pembersihan/usecase"
	frameworkFiber "github.com/farmease/farmease-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pembersihan",
	fx.Provide(
		postgresql.NewPembersihanRepository,
		usecase.NewPembersihanUsecase,
		http.NewPembersihanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PembersihanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)
