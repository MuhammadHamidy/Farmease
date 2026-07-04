package stok

import (
	"github.com/farmease/kebun-be/kebun/module/stok/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/stok/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/stok/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("stok",
	fx.Provide(
		postgresql.NewStokRepository,
		usecase.NewStokUsecase,
		http.NewStokHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.StokHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

