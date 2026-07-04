package pembersihan

import (
	"github.com/farmease/kebun-be/kebun/module/pembersihan/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/pembersihan/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/pembersihan/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
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

