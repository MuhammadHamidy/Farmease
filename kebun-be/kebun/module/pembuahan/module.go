package pembuahan

import (
	"github.com/farmease/kebun-be/kebun/module/pembuahan/delivery/http"
	"github.com/farmease/kebun-be/kebun/module/pembuahan/repository/postgresql"
	"github.com/farmease/kebun-be/kebun/module/pembuahan/usecase"
	frameworkFiber "github.com/farmease/kebun-be/framework/fiber"
	"go.uber.org/fx"
)

var Module = fx.Module("pembuahan",
	fx.Provide(
		postgresql.NewPembuahanRepository,
		usecase.NewPembuahanUsecase,
		http.NewPembuahanHandler,
	),
	fx.Provide(
		fx.Annotate(
			func(h *http.PembuahanHandler) frameworkFiber.Router { return h },
			fx.ResultTags(`group:"routers"`),
			fx.As(new(frameworkFiber.Router)),
		),
	),
)

